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
            <div class="championship-name">${gamedatas.championship.name}</div>`;

        gamedatas.championship.circuits.forEach((circuit, index) => 
            
            html += `
            <div class="championship-circuit ${gamedatas.championship.index == index ? 'current' : ''}" data-index="${index}">
                <span class="circuit-name">${circuit.name}</span>
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
}