import React, { useRef, useState } from 'react';
import { FaCartPlus } from 'react-icons/fa';
import './App.css';

type CartPosition = {
  cartLeft: number;
  cartTop: number;
  btnLeft: number;
  btnTop: number;
  G: number;
  v: number;
  H: number;
  S: number;
  directionLeft: boolean;
  theta: number;
};

type BallPosition = {
  left: string;
  top: string;
};

const useCartAnimation = () => {
  const [ballPos, setBallPos] = useState({ top: '', left: '' });
  const [running, setRunning] = useState(false);

  function animate({
    cartBox,
    e,
  }: {
    cartBox: React.RefObject<HTMLDivElement>;
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>;
  }) {
    setRunning(true);
    const position = {
      cartLeft: cartBox.current!.offsetLeft,
      cartTop: cartBox.current!.offsetTop,
      btnLeft: e.currentTarget.offsetLeft + e.currentTarget.offsetWidth / 2,
      btnTop: e.currentTarget.offsetTop,
      G: 10,
      v: 0,
      H:
        e.currentTarget.offsetTop - cartBox.current!.offsetTop - window.scrollY,
      S:
        cartBox.current!.offsetLeft -
        (e.currentTarget.offsetLeft + e.currentTarget.offsetWidth / 2),
      directionLeft: true,
      theta: 0,
    };

    calcOrbit(position);
    startAnimation(position);
  }

  function calcOrbit(position: CartPosition) {
    const { cartLeft, btnLeft, G, v, H, S } = position;

    const b = (-1 * (2 * v * v * S)) / (G * S * S);
    const c = 1 + (2 * v * v * H) / (G * S * S);
    const D = b * b - 4 * c;

    if (D >= 0) {
      const tanTheta0 = Math.atan((-b - Math.sqrt(D)) / 2);
      const tanTheta1 = Math.atan((-b + Math.sqrt(D)) / 2);
      position.theta = Math.max(tanTheta0, tanTheta1);

      if (cartLeft < btnLeft) {
        position.directionLeft = false;
      }
      startAnimation(position);
    } else {
      position.v++;
      calcOrbit(position);
    }
  }

  function startAnimation({
    cartLeft,
    btnLeft,
    btnTop,
    v,
    G,
    directionLeft,
    theta,
  }: CartPosition) {
    const startTime = performance.now();
    requestAnimationFrame(loop);

    function loop(nowTime: number) {
      const t = Math.max((nowTime - startTime) / 60, 0);
      const x = v * Math.cos(theta) * t;
      let y =
        Math.tan(theta) * x -
        (G / (2 * v * v * Math.cos(theta) * Math.cos(theta))) * x * x;
      if (!directionLeft) {
        y =
          -Math.tan(theta) * x -
          (G / (2 * v * v * Math.cos(theta) * Math.cos(theta))) * x * x;
      }

      setBallPos({
        left: String(Math.round(btnLeft + x)) + 'px',
        top: String(Math.round(btnTop - y)) + 'px',
      });

      if (
        (directionLeft && btnLeft + x <= cartLeft) ||
        (!directionLeft && btnLeft - x > cartLeft)
      ) {
        requestAnimationFrame(loop);
      } else {
        setRunning(false);
        setBallPos({ top: '', left: '' });
      }
    }
  }

  return { animate, ballPos, running };
};

function App() {
  const { animate, ballPos, running } = useCartAnimation();

  const cartBox = useRef<HTMLDivElement>(null);
  const ball = useRef<HTMLDivElement>(null);

  const onCartInClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    animate({ cartBox, e });
  };

  const CartBall = (pos: BallPosition) => {
    return <div className='st-ball' ref={ball} style={pos} />;
  };

  return (
    <>
      <header>
        <div className='header-container'>
          <div className='cart-total' ref={cartBox}>
            <FaCartPlus size={32} />
          </div>
        </div>
      </header>
      <div className='container'>
        <div className='notice-area'>お知らせエリア</div>
        <div className='product-container'>
          {[...Array(8)].map((_, idx) => (
            <div className='product-card' key={idx}>
              <div className='product-card-img'></div>
              <button className='btn' onClick={onCartInClick}>
                add
              </button>
            </div>
          ))}
        </div>
      </div>
      {running && <CartBall {...ballPos} />}
    </>
  );
}

export default App;
