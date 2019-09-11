import {render} from 'react-dom';
import React, {useState, useEffect, useRef, createElement} from 'react';
import {parse} from 'query-string';
// Environment Values and Setup Values
const {innerHeight: iH, innerWidth: iW, location} = window;
const [{floor: fl, random: r, sqrt}, {delay}] = [Math, parse(location.search)];
const size = fl(sqrt((iH * iW) / (parse(location.search).cellcount || 1000)));
const [R, C, B, W] = [fl(iH / size), fl(iW / size), 'black', 'white'];
const [pW, pH, bg] = [fl(iW / C), fl(iH / R), 'background'];
let [w, h, Z, n, ns] = [pW * C, pH * R, {}, 0, 0];
let cells = [...Array(R)].map(() => [...Array(C)].map(() => fl(r() * 2)));
const neighbCount = cells.map((r, i) =>
	r.map((_, j) =>
		[0, 1, 2, 3, 5, 6, 7, 8].reduce((z, d) => {
			let [r, c, v] = [i + (d % 3), j + fl(d / 3), i + (d % 3) <= R];
			return r && v && c && c <= C ? [...z, {x: r - 1, y: c - 1}] : z;
		}, [])
	)
);
// Styles
const s1 = {position: 'fixed', top: '25px', left: `${iW - 75}px`};
const [s, D, N] = [{...s1, width: '50px', height: '50px'}, 'red', 'green'];
const fC = (x, y, f) => [(Z.fillStyle = f ? B : W), Z.fillRect(x, y, pW, pH)];
// Game Logic
const tick = () =>
	cells.map((r, i) =>
		r.map((state, j) => {
			n = neighbCount[i][j].reduce((a, {x, y}) => a + cells[x][y], 0);
			ns = state ? n < 4 && n > 1 : n === 3; // rules
			return ns !== state ? [fC(j * pW, i * pH, ns), ns][1] : ns;
		})
	);
const toggle = ({clientX, clientY}) => {
	let [r, c] = [fl((clientY - 1) / pH), fl((clientX - 1) / pW)];
	if (c >= 0 && r >= 0) fC(c * pW, r * pH, (cells[r][c] = !cells[r][c]));
};
// User Interface, State Control
const App = () => {
	const [[g, G], E] = [useState(true), useRef(null)];
	useEffect(() => {
		Z = E.current.getContext('2d');
		let id = setInterval(() => g && (cells = tick()), delay || 100);
		return () => clearInterval(id);
	}, [g, E]);
	const BT = <button style={{...s, [bg]: g ? D : N}} onClick={() => G(!g)} />;
	const CA = <canvas ref={E} width={w} height={h} onClick={e => toggle(e)} />;
	return createElement('div', null, BT, CA);
};
render(<App />, document.getElementById('root'));
