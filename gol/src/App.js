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
// Styles
const AppContainer = styled.div`
	display: grid;
	grid: repeat(${rows}, ${size}px) / repeat(${cols}, ${size}px);
`;
const Cell = styled.div`
	background: ${props => (props.bg ? 'black' : 'white')};
`;
// Game Logic
const getNeighbors = (cells, i) => {
	let [count, mod, cm1, bttm] = [0, i % cols, cols - 1, rows * cols - cols];
	if (i > cols && mod !== 0 && cells[i - (cols + 1)]) count++; // upper left
	if (i > cols && cells[i - cols]) count++; // upper center
	if (i > cols && mod !== cm1 && cells[i - cm1]) count++; // upper right
	if (i < bttm && mod !== cm1 && cells[i + cols + 1]) count++; // lower right
	if (i < bttm && cells[i + cols]) count++; // lower center
	if (i < bttm && mod !== 0 && cells[i + cm1]) count++; // lower left
	if (mod !== cm1 && cells[i + 1]) count++; // right
	if (mod !== 0 && cells[i - 1]) count++; // left
	return count;
};
const tick = prevCells =>
	prevCells.map((state, i) => {
		const count = getNeighbors(Array.from(prevCells), i);
		return state ? (count < 4 ? [f, f, t, t][count] : f) : count === 3 && t;
	});
const tog = (cells, i) => cells.map((s, j) => (j === i ? !s : s));
// User Interface
export default () => {
	const [cells, setCells] = useState(seed.map(() => floor(random() * 2)));
	useEffect(() => {
		const id = setInterval(() => setCells(p => tick(p)), delay || 1000);
		return () => clearInterval(id);
	}, []);
	return (
		<AppContainer>
			{cells.map((s, i) => (
				<Cell key={i} bg={s} onClick={() => setCells(p => tog(p, i))} />
			))}
		</AppContainer>
	);
};
