import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {parse} from 'query-string';
// Environment Values
const {floor, random, sqrt} = Math;
const {innerHeight, innerWidth, location} = window;
const {cellcount, delay} = parse(location.search);
const size = floor(sqrt((innerHeight * innerWidth) / cellcount || 1000));
const [rows, cols] = [floor(innerHeight / size), floor(innerWidth / size)];
const [t, f, seed] = [true, false, Array(rows * cols).fill(0)];
const cNeighbors = seed.map((_, i) => {
	let [mod, cm1, btm, t] = [i % cols, cols - 1, rows * cols - cols, []];
	if (i > cm1 && mod !== 0) t.push(i - (cols + 1)); // upper left
	if (i > cm1) t.push(i - cols); // upper center
	if (i > cm1 && mod !== cm1) t.push(i - cm1); // upper right
	if (i < btm && mod !== cm1) t.push(i + cols + 1); // lower right
	if (i < btm) t.push(i + cols); // lower center
	if (i < btm && mod !== 0) t.push(i + cm1); // lower left
	if (mod !== cm1) t.push(i + 1); // right
	if (mod !== 0) t.push(i - 1); // left
	return t;
});
// Component Styles
const AppContainer = styled.div`
	display: grid;
	grid: repeat(${rows}, ${size}px) / repeat(${cols}, ${size}px);
`;
const Cell = styled.div`
	background: ${props => (props.bg ? 'black' : 'white')};
`;
const Button = styled.div`
	width: 50px;
	height: 50px;
	border: 1px solid black;
	border-radius: 100%;
	border-width: 0.5px 0.5px 2px 0.5px;
	position: fixed;
	top: 25px;
	left: ${innerWidth - 75}px;
	background: white;
	text-align: center;
	font-weight: bolder;
	line-height: 3.3;
	&:active {
		transform: translate(0, 1px);
		border: 1px solid black;
	}
`;
// Game Logic
const tick = p =>
	p.map((state, i) => {
		let c = cNeighbors[i].reduce((r, v) => r + p[v], 0); // neighbor count
		return state ? (c < 4 ? [f, f, t, t][c] : f) : c === 3 && t; // rules
	});
const tog = (cells, i) => cells.map((s, j) => (j === i ? !s : s));
// User Interface
export default () => {
	const [cells, setCells] = useState(seed.map(() => floor(random() * 2)));
	const [go, setGo] = useState(true);
	useEffect(() => {
		let id = setInterval(() => go && setCells(p => tick(p)), delay || 1000);
		return () => clearInterval(id);
	}, [go]);
	return (
		<AppContainer>
			<Button onClick={() => setGo(!go)}>{go ? '| |' : '▶'}</Button>
			{cells.map((s, i) => (
				<Cell key={i} bg={s} onClick={() => setCells(p => tog(p, i))} />
			))}
		</AppContainer>
	);
};
