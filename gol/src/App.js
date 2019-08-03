import React, {useState, useEffect, useRef} from 'react';
import {parse} from 'query-string';
// Environment Values and Setup Values
const {floor: fl, random: r, sqrt} = Math;
const {innerHeight: iH, innerWidth: iW, location} = window;
const {cellcount, delay} = parse(location.search);
const size = fl(sqrt((iH * iW) / (cellcount || 1000)));
const [R, C] = [fl(iH / size), fl(iW / size)];
const [pW, pH, bg] = [fl(iW / C), fl(iH / R), 'background'];
let [t, f, w, h, ctx] = [true, false, pW * C, pH * R, {}];
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
const [s, E, I] = [{...s1, width: '50px', height: '50px'}, 'red', 'green'];
const fillCell = (x, y, fill) => {
	ctx.fillStyle = fill ? 'black' : 'white';
	ctx.fillRect(x * pW, y * pH, pW, pH);
};
// Game Logic
const tick = () =>
	(cells = cells.map((r, i) =>
		r.map((state, j) => {
			let n = neighbCount[i][j].reduce((a, {x, y}) => a + cells[x][y], 0);
			let alive = state ? (n < 4 ? [f, f, t, t][n] : f) : n === 3; // rules
			if (alive !== state) fillCell(j, i, alive);
			return alive;
		})
	));
const tog = ({clientX, clientY}) => {
	let [r, c] = [fl((clientY - 1) / pH), fl((clientX - 1) / pW)];
	if (c >= 0 && r >= 0) fillCell(c, r, (cells[r][c] = !cells[r][c]));
};
// User Interface
export default () => {
	const [[g, G], cRef] = [useState(true), useRef(null)];
	useEffect(() => {
		ctx = cRef.current.getContext('2d');
		let id = setInterval(() => g && tick(), delay || 100);
		return () => clearInterval(id);
	}, [g, cRef]);
	return (
		<>
			<button style={{...s, [bg]: g ? E : I}} onClick={() => G(!g)} />
			<canvas ref={cRef} width={w} height={h} onClick={e => tog(e)} />
		</>
	);
};
