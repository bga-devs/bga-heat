class ChampionshipTable {
    constructor(private game: HeatGame, gamedatas: HeatGamedatas) {
        let html = `
        <div id="championship-table">
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

        document.getElementById('table-center').insertAdjacentHTML('beforebegin', html);

        const championshipCircuuits = document.getElementById('championship-circuits');
        championshipCircuuits.addEventListener('click', () => {
            championshipCircuuits.dataset.folded = (championshipCircuuits.dataset.folded == 'false').toString();
        });
    }
    
    public newChampionshipRace(index: number) {
        document.querySelectorAll('.championship-circuit').forEach((elem: HTMLElement) => elem.classList.toggle('current', Number(elem.dataset.index) == index));
    }
}