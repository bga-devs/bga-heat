class ChampionshipTable {
    constructor(private game: HeatGame, private gamedatas: HeatGamedatas) {
        let html = `
        <div id="championship-table">
            <div id="championship-circuits-progress" style="--race-count: ${gamedatas.championship.circuits.length};"><div></div>`;

            gamedatas.championship.circuits.forEach((_, index) =>             
                html += `
                <div id="circuit-progress-${index}" class="circuit-progress ${gamedatas.championship.index > index ? 'finished' : ''}">
                    <div id="current-circuit-progress-${index}" class="current-circuit-progress"></div>
                </div>`
            );

            html += `
            </div>
            <div id="championship-circuits" data-folded="true" style="--race-count: ${gamedatas.championship.circuits.length};">
            <div class="championship-name">
                ${gamedatas.championship.name}
                <button type="button" id="scorepad-button" class="bgabutton bgabutton_blue"><div class="scorepad-icon"></div></button>
            </div>`;

        gamedatas.championship.circuits.forEach((circuit, index) => 
            
            html += `
            <div class="championship-circuit ${gamedatas.championship.index == index ? 'current' : ''}" data-index="${index}">
                <span class="circuit-name">${_(circuit.name)}</span>
                ${this.game.eventCardsManager.getHtml(circuit.event)}
            </div>
            `
        );
            
        html += `
            </div>
        </div>
        `;

        document.getElementById('top').insertAdjacentHTML('afterbegin', html);

        const championshipCircuits = document.getElementById('championship-circuits');
        championshipCircuits.addEventListener('click', () => {
            championshipCircuits.dataset.folded = (championshipCircuits.dataset.folded == 'false').toString();
        });

        this.setRaceProgress(gamedatas.progress);

        gamedatas.championship.circuits.forEach(circuit => this.game.setTooltip(`event-card-${circuit.event}`, this.game.eventCardsManager.getTooltip(circuit.event)));

        document.getElementById('scorepad-button').addEventListener('click', e => this.showScorepad(e));
    }
    
    public newChampionshipRace(index: number) {
        this.setRaceFinished(index - 1);
        document.querySelectorAll('.championship-circuit').forEach((elem: HTMLElement) => elem.classList.toggle('current', Number(elem.dataset.index) == index));
        this.gamedatas.championship.index = index;
    }

    public setRaceProgress(progress: number) {
        document.getElementById(`current-circuit-progress-${this.gamedatas.championship.index}`).style.width = `${Math.min(100, progress * 100)}%`;
    }

    public setRaceFinished(index: number) {
        document.getElementById(`circuit-progress-${index}`).classList.add('finished');
    }

    private showScorepad(e: MouseEvent) {
        e.stopImmediatePropagation();  
        const scores =  this.gamedatas.scores;
        
        const scorepadDialog = new ebg.popindialog();
        scorepadDialog.create('scorepadDialog');
        scorepadDialog.setTitle(this.gamedatas.championship.name);
        
        let html = `<div id="scorepad-popin">
            <div id="scorepad-image">
                <table>
                <tr class="names">
                    <th></th>`;
    
        [5, 1, 2, 3, 0, 4].forEach(constructorId => {
            html += `<td>`;
            const constructor = this.gamedatas.constructors[constructorId];
            if (constructor) {
                html += `<div class="name"><div class="constructor-avatar ${constructor.ai ? 'legend' : 'player'}" style="`;
                if (constructor.ai) {
                    html += `--constructor-id: ${constructor.id};`;
                } else {
                    // ? Custom image : Bga Image
                    //url = url.replace('_32', url.indexOf('data/avatar/defaults') > 0 ? '' : '_184');
                    html += `background-image: url('${(document.getElementById(`avatar_${constructor.pId}`) as HTMLImageElement).src}');`;
                }
                html += `"></div> <strong style="color: #${CONSTRUCTORS_COLORS[constructor.id]};">${_(constructor.name)}</strong></div>`;
            }
            html += `</td>`;
        });
        html += `</tr>`;

        this.gamedatas.championship.circuits.forEach((circuit, index) => {
            html += `
            <tr>
                <th>${_(circuit.name)}</th>`;

                [5, 1, 2, 3, 0, 4].forEach(constructorId => {
                    html += `<td class="score">`;
                    if (scores[index]?.[constructorId]) {
                        html += `${scores[index][constructorId]}`;
                        if (index > 0) {
                            html += `<div class="subTotal">${Array.from(Array(index + 1)).map((_, subIndex) => scores[subIndex][constructorId]).reduce((a, b) => a + b, 0)}</div>`;
                        }
                    }
                    html += `</td>`;
                });
            
            html += `</tr>`;
        });
            
        html += `</table></div>
        </div>`;
        
        // Show the dialog
        scorepadDialog.setContent(html);
        scorepadDialog.show();
    }
}