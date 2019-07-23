import React, {useState, useEffect, useRef} from 'react';
import styled from 'styled-components';
import {parse} from 'query-string';
// Environment Values
const {floor, random, sqrt} = Math;
const {innerHeight, innerWidth, location} = window;
const {cellcount, delay} = parse(location.search);
const size = floor(sqrt((innerHeight * innerWidth) / (cellcount || 1000)));
const [rows, cols] = [floor(innerHeight / size), floor(innerWidth / size)];
const [pW, pH] = [floor(innerWidth / cols), floor(innerHeight / rows)];
const [t, f, w, h] = [true, false, pW * cols, pH * rows];
let [ctx, cells] = [{}, [...Array(rows)].map(() => [...Array(cols)])];
cells = cells.map(r => r.map(() => floor(random() * 2)));
const cNeighbors = cells.map((r, i) =>
	r.map((_, j) => {
		let neighbors = [];
		for (let dir = 0; dir < 9; dir++) {
			let [n_r, n_c] = [i + ((dir % 3) - 1), j + (floor(dir / 3) - 1)];
			if (dir !== 4 && n_r >= 0 && n_r < rows && n_c >= 0 && n_c < cols)
				neighbors.push({x: n_r, y: n_c});
		}
		return neighbors;
	})
);
// Styles
const Button = styled.button`
	width: 50px;
	height: 50px;
	position: fixed;
	top: 25px;
	left: ${innerWidth - 75}px;
`;
const fillCell = (x, y, fill) => {
	ctx.fillStyle = fill ? 'black' : 'white';
	ctx.fillRect(x * pW, y * pH, pW, pH);
};
// Game Logic
const tick = () =>
	(cells = cells.map((r, i) =>
		r.map((state, j) => {
			let n = cNeighbors[i][j].reduce((a, {x, y}) => a + cells[x][y], 0); // neighbor count
			let alive = state ? (n < 4 ? [f, f, t, t][n] : f) : n === 3; // rules
			if (alive !== state) fillCell(j, i, alive);
			return alive;
		})
	));
const tog = ({clientX, clientY}) => {
	let [r, c] = [floor((clientY - 10) / pH), floor((clientX - 10) / pW)];
	if (c >= 0 && r >= 0) fillCell(c, r, (cells[r][c] = !cells[r][c]));
};
// User Interface
export default () => {
	const [[go, setGo], cRef] = [useState(true), useRef(null)];
	useEffect(() => {
		ctx = cRef.current.getContext('2d');
		let id = setInterval(() => go && tick(), delay || 100);
		return () => clearInterval(id);
	}, [go, cRef]);
	return (
		<>
			<Button onClick={() => setGo(!go)}>{go ? '| |' : '▶'}</Button>
			<canvas ref={cRef} width={w} height={h} onClick={e => tog(e)} />
		</>
	);
};
