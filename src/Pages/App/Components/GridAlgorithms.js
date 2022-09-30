import React, { useState, useRef, useEffect, useContext, createRef } from 'react';
import { Algorithms } from '../services/Algorithms';
import { TraversalAlgorithms } from '../services/Traversals';
import { DynamicProgramming } from '../services/DynamicProgramming';
import { Dijkstras } from '../services/Dijkstras';
import { algorithmStorage } from '../services/AlgorithmStorage';
import '../Styles/GridAlgorithms.css';
import { ContextProvider } from '../index';
import Editor from './Editor';

let grid = [];
const MAX_SIZE = 30;
const MIN_SIZE = 1;

function GridAlgorithms({ algorithm }) {
    const [row, setRow] = useState(10);
    const [col, setCol] = useState(10);

    const context = useContext(ContextProvider);
    const rowsInput = useRef();
    const colsInput = useRef();

    const [startSelected, setStartSelected] = useState(false);
    const [endSelected, setEndSelected] = useState(false);

    function updateGridSize() {
        const rowSize = parseInt(rowsInput.current.value);
        const colSize = parseInt(colsInput.current.value);
        rowsInput.current.value = '';
        colsInput.current.value = '';
        
        if (rowSize >= MIN_SIZE && rowSize <= MAX_SIZE && colSize >= MIN_SIZE && colSize <= MAX_SIZE) {
            setRow(parseInt(rowSize));
            setCol(parseInt(colSize));

            if ((algorithm === algorithmStorage.dp || algorithm === algorithmStorage.dijkstra)
                && (rowSize > row || colSize > col)) {
                context.setDisable(true);
            }
        }
    }

    return (
        <React.Fragment>
            <div id={context.editor ? '' : 'fullSize'} className={context.darkMode ? 'content cont-dark' : 'content'}>
                <Actions algorithm={algorithm} setStartSelected={setStartSelected} setEndSelected={setEndSelected} />
                <div className="gridComponent">
                    <button className="mobileTopics reset" onClick={context.toggleMobileTopics}>View Algorithms</button>
                    <div className="gridDimensions">
                        <input className={context.darkMode ? 'dark-input' : ''} disabled={context.disable} 
                            type="number" min={MIN_SIZE} max={MAX_SIZE} ref={rowsInput} placeholder={`Rows: {Max ${MAX_SIZE}}`} 
                            id="rows"/>
                        <input className={context.darkMode ? 'dark-input' : ''} disabled={context.disable} 
                            type="number" min={MIN_SIZE} max={MAX_SIZE} ref={colsInput} placeholder={`Cols: {Max ${MAX_SIZE}}`} 
                            id="cols"/>
                        <button id="updateSize" disabled={context.disable} onClick={updateGridSize} 
                        className={context.disable ? 'disabled' : ''}>Update Size</button>
                    </div>
                    <table className="grid">
                        <Grid 
                            row={row} col={col} algorithm={algorithm} 
                            setStartSelected={setStartSelected} setEndSelected={setEndSelected}
                            startSelected={startSelected} endSelected={endSelected}
                        />
                    </table>
                </div>
            </div>
            <Editor algorithm={algorithm}></Editor>
        </React.Fragment>
    );
}

function Actions({ algorithm, setStartSelected, setEndSelected }) {
    const [actionsDiv, setActionsDiv] = useState(true);
    const [clear, setClear] = useState(false);
    const context = useContext(ContextProvider);
    const clearButton = useRef();
    const actions = useRef();

    const selectButton = (state, value) => {
        context.setStartNode(false);
        context.setEndNode(false);
        context.setObstacle(false);
        state(!value);
    };

    function clearCells() {
        if (clear) {
            return;
        }
        
        context.setObstacle(false);
        context.setStartNode(false);
        context.setEndNode(false);
        context.setDisable(false);

        setStartSelected(false);
        setEndSelected(false);

        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[0].length; j++) {
                const element = grid[i][j].ref.current;
                element.removeAttribute('class');

                if (algorithm !== algorithmStorage.dp && algorithm !== algorithmStorage.dijkstra) element.textContent = '';
                else element.textContent = Math.floor(Math.random() * 20) + 1;
            }
        }
    }

    function runVisual() {
        setClear(true);
        context.setDisable(true);

        const visualiseDFS = (startNode, grid) => {
            TraversalAlgorithms.runDFS(startNode, grid, context.speed).then(({ prevNodes, end }) => {
                TraversalAlgorithms.backtrackTraversal(prevNodes, end, grid, context.speed).then(() => {
                    localStorage.setItem(algorithm, 'true');
                });
            });
        };

        const visualiseBFS = (startNode, grid) => {
            TraversalAlgorithms.runBFS(startNode, grid, context.speed).then(({ prevNodes, end }) => {
                TraversalAlgorithms.backtrackTraversal(prevNodes, end, grid, context.speed).then(() => {
                    localStorage.setItem(algorithm, 'true');
                });
            });
        };

        const visualiseDP = (grid) => {
            DynamicProgramming.run(grid, context.speed).then(({ end, grid }) => {
                DynamicProgramming.backtrackDP(end, grid, context.speed).then(() => {
                });
            });
        };

        const visualiseDijkstras = (startNode, grid) => {
            Dijkstras.run(startNode, grid, context.speed).then(({ grid, endNode, prevNodes }) => {
                Dijkstras.backtrackDijkstra(grid, endNode, prevNodes, context.speed).then(() => {
                    localStorage.setItem(algorithm, 'true');
                });
            });
        };

        const res = Algorithms.checkCells(grid, algorithm);
        res.then((startNode) => {
            if (algorithm === algorithmStorage.dfs) visualiseDFS(startNode, grid);
            if (algorithm === algorithmStorage.bfs) visualiseBFS(startNode, grid);
            if (algorithm === algorithmStorage.dp) visualiseDP(grid);
            if (algorithm === algorithmStorage.dijkstra) visualiseDijkstras(startNode, grid);
            setClear(false);
        })
        .catch((error) => {
            context.setDisable(false);
            setClear(false);
            alert(error);
        });
    }

    return (
        <React.Fragment>
            <div className="minimiseContainer">
                <div className="minimise" onClick={() => setActionsDiv((curState) => !curState)}></div>
            </div>
            {actionsDiv && <div className="actions" ref={actions}>
                <h2 style={{color: 'white'}}>{algorithm}</h2>
                <div className="actionButtons">
                    {algorithm !== algorithmStorage.dp && <button 
                        disabled={context.disable} className={context.disable ? 'disabled' : context.startNode ? 'selectedChoice' : ''} 
                        onClick={() => selectButton(context.setStartNode, context.startNode)}>Set Start Node
                    </button>}
                    {algorithm !== algorithmStorage.dp && <button 
                        disabled={context.disable} className={context.disable ? 'disabled' : context.endNode ? 'selectedChoice' : ''} 
                        onClick={() => selectButton(context.setEndNode, context.endNode)}>Set End Node
                    </button>}
                    {algorithm !== algorithmStorage.dp && <button 
                        disabled={context.disable} className={context.disable ? 'disabled' : context.obstacle ? 'selectedChoice' : ''}  
                        onClick={() => selectButton(context.setObstacle, context.obstacle)}>Place Obstacle
                    </button>}
                    <button onClick={clearCells} ref={clearButton} disable={`${clear}`} className={clear ? 'disabled' : ''}>Reset</button>
                    <button disabled={context.disable} className={context.disable ? 'disabled' : ''} onClick={runVisual}>Run</button>
                </div>
                <div className="keys">
                    <div id="algorithm">
                        <p>Algorithm</p>
                        <div></div>
                    </div>
                    <div id="path">
                        <p>{algorithm === algorithmStorage.dp ? 'Smaller sum found' : algorithm === algorithmStorage.bfs ? 'Shortest path' : 'Path found'}</p>
                        {algorithm === algorithmStorage.dp ? <div className="modified"></div> : <div></div>}
                    </div>
                    {algorithm === algorithmStorage.dp && 
                    <div>
                        <p>Smallest sum path</p>
                        <div className="smallestSum"></div>
                    </div>}
                </div>
            </div>}
        </React.Fragment>
    );
}

function Grid({ row, col, algorithm, setStartSelected, setEndSelected, startSelected, endSelected }) {
    const context = useContext(ContextProvider);
    const gridRefs = useRef(new Array(row));
    
    useEffect(() => {
        gridRefs.current = new Array(row);
    });

    const removeStyle = (cell) => {
        if (cell.classList.contains('startNodeSelected')) setStartSelected(false);
        if (cell.classList.contains('endNodeSelected')) setEndSelected(false);
        cell.removeAttribute('class');
    };

    const highlightCell = (e) => {
        const cell = e.target;
        if (context.disable) {
            return;
        }

        if (context.startNode && !startSelected) {
            removeStyle(cell);
            context.setStartNode(false);
            setStartSelected(true);
            cell.classList.add('startNodeSelected');

            if (algorithm === algorithmStorage.dijkstra) {
                cell.classList.add('dijkstraStart');
                cell.textContent = '0';
            }
        }
        else if (context.endNode && !endSelected) {
            removeStyle(cell);
            context.setEndNode(false);
            setEndSelected(true);
            cell.classList.add('endNodeSelected');

            if (algorithm === algorithmStorage.dijkstra) {
                cell.classList.add('dijkstraEnd');
                cell.textContent = '0';
            }
        }
        else if (context.obstacle) {
            if (cell.classList.length === 0) {
                removeStyle(cell);
                cell.classList.add('obstacleSelected');
                cell.textContent = '';
            }
        }
        else {
            if (algorithm === algorithmStorage.dijkstra && (cell.classList.contains('dijkstraStart') 
                || cell.classList.contains('dijkstraEnd') || cell.classList.contains('obstacleSelected'))) {
                cell.textContent = Math.floor(Math.random() * 20) + 1;
            }

            removeStyle(cell);
        }
    };

    grid = constructGrid(gridRefs, row, col, context.darkMode, highlightCell);
    return (
        <tbody>
            {grid.map((row, index) => {
                return (
                    <tr key={`${index}`}>
                        {row.map((col) => col)}
                    </tr>
                );
            })}
        </tbody>
    );
}

function constructGrid(gridRefs, row, col, darkMode, highlightCell) {
    for (let i = 0; i < row; i++) {
        gridRefs.current[i] = new Array(col);
        for (let j = 0; j < col; j++) {
            gridRefs.current[i][j] = createRef();
        }
    }

    return gridRefs.current.map((row, i) => {
        return row.map((_, j) => {
            return (
                <td 
                    key={`${i},${j}`} id={`${i},${j}`} ref={gridRefs.current[i][j]}
                    style={darkMode ? {color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.4)'} : {}} 
                    onMouseDown={highlightCell}>
                </td>
            );
        });
    });
}

export default GridAlgorithms;