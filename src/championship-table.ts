class ChampionshipTable {
    constructor(private game: HeatGame, gamedatas: HeatGamedatas) {
        let html = `
        <div id="championship-table">
            <div id="championship-circuits">`;

        gamedatas.championship.circuits.forEach((circuit, index) => 
            
            html += `
            <div class="championship-circuit ${gamedatas.championship.index == index ? 'current' : ''}" data-index="${index}">
                ${circuit.circuit}
            </div>
            `
        );
            
        html += `
            </div>
        </div>
        `;

        document.getElementById('table-center').insertAdjacentHTML('beforebegin', html);
    }
    
    public newChampionshipRace(index: number) {
        document.querySelectorAll('.championship-circuit').forEach((elem: HTMLElement) => elem.classList.toggle('current', Number(elem.dataset.index) == index));
    }
}