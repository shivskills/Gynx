/* 

okay so final algorithm is to maybe have like 3 sets of predetermined nodes. 
The algorithm will randomly choose from those 3. It will have some predetermined step size of maybe 3-4. 
Then will we use drunk walker to create the zig zag. I think we should say that as the blocks before turn are 
increasing before a turn, we should increase the probability that the next block is a turn. Then will do the random 
probability with the remaning walls


Thinking of using kruskal's algorithm but this might make the game lack the winding maze features since its
a minimum spanning tree (shortest path) --> will probably just implement drunk walk 
*/
export class Maze {
    private width: number; 
    private height: number; 
    private stepSize: number; 
    private nodes: { x: number; y: number; id: number }[] = [];

    constructor(width: number, height: number, pathBias: number = 0.4, stepSize: number = 7) {
        this.width = width;
        this.height = height;
        this.stepSize = stepSize;
    }

    public initializeMaze(): number[][] {
        const grid: number[][] = Array.from({ length: this.height }, () => new Array(this.width).fill(1)); // 2d array of all 1s

        // Node generation
        let nodesCount = 0; // number of nodes
        

        const nodeCords: { x: number; y: number; id: number }[] = [];  // coordinates w/ID --> x: 3, y: 4, id: 1

        for(let y = 0; y < this.height - this.stepSize; y += this.stepSize) {
            for (let x = 0; x < this.width - this.stepSize; x += this.stepSize) {
                const row = grid[y];
                if (!row) continue;
                row[x] = 0;
                
                nodeCords.push({x: x, y: y, id: nodesCount});
                nodesCount++;
            }
        }

        // store nodes on the instance for debugging -- change later ;; 
        this.nodes = nodeCords;

        //edge generation 

        const edges: { n1: {x:number,y:number,id:number}, n2: {x:number,y:number,id:number}, weight: number }[] = []; // edges between node coords

        // buildilng edge map by checking adjacent nodes --> no diagnols
        for (let i = 0; i < nodeCords.length; i++) { // for each node, check all remaining nodes
            let n1 = nodeCords[i]; 
            for (let j = i + 1; j < nodeCords.length; j++) {
                let n2 = nodeCords[j]; 
                let isAdj = (Math.abs(n1.x - n2.x) === this.stepSize && n1.y === n2.y) || (Math.abs(n1.y - n2.y) === this.stepSize && n1.x === n2.x); 

                if (isAdj) {
                    edges.push({n1: n1, n2: n2, weight: Math.random()}); // weight for kurshal's algo but i haven't implemented that yet
                }
            }
        }

        // zig zag creation --> 1.) force a turn; 2.) grav pull; 3.) inertia 
        let directions = [
            { x: 0, y: -1, label: 'N' }, // Up 1 tile
            { x: 0, y: 1,  label: 'S' }, // Down 1 tile
            { x: -1, y: 0, label: 'W' }, // Left 1 tile
            { x: 1, y: 0,  label: 'E' }  // Right 1 tile
        ];
        let currentDir = directions[Math.floor(Math.random() * directions.length)]; 
        for(let i = 0; i < edges.length; i++) {
            const n1Cords = edges[i].n1;
            const n2Cords = edges[i].n2;

            let cx = n1Cords.x; // had to create these so they don't create references and change n1's coords reference
            let cy = n1Cords.y;
            let straightStreak = 0; 

            while (cx !== n2Cords.x || cy !== n2Cords.y) { // while the two nodes are not connected

            
                let smartDirections = [];
                
                let dx = n2Cords.x - cx; 
                let dy = n2Cords.y - cy; 
                if (dx > 0) smartDirections.push({ x: 1, y: 0, label: 'E' });
                if (dx < 0) smartDirections.push({ x: -1, y: 0, label: 'W' });
                if (dy > 0) smartDirections.push({ x: 0, y: 1, label: 'S' });
                if (dy < 0) smartDirections.push({ x: 0, y: -1, label: 'N' });
                let chosenDir; 

                let turnProbility = 0.05 + (straightStreak * 0.32) // more likely to turn when we go straight for a while --> change later if needed

                if(Math.random() < turnProbility) {
                    let availableTurns = directions.filter(d => d.label !== currentDir?.label);
                    chosenDir = availableTurns[Math.floor(Math.random() * availableTurns.length)];
                    straightStreak = 0;
                } else if (Math.random() < .45) {
                    chosenDir = smartDirections[Math.floor(Math.random() * smartDirections.length)];
                   // straightStreak = 0; // may change this later; 
                } else {
                    chosenDir = currentDir; 
                    straightStreak++;
                }

                cx += (chosenDir.x)  ;
                cy += ( chosenDir.y );

                // check if valid direction and if so break wall
                if (cy >= 0 && cy < this.height) {
                    const r = grid[cy];
                    if (r && cx >= 0 && cx < r.length) r[cx] = 0; // break wall
                }
                currentDir = chosenDir;
            }

        } 



        return grid;
    }

    public getNodes(): { x: number; y: number; id: number }[] {
        return this.nodes;
    }


}