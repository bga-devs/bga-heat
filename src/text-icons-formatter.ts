function formatTextIcons(rawText: string) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/<KNOWLEDGE>/ig, '<span class="icon knowledge"></span>')
        .replace(/<LOST_KNOWLEDGE>/ig, '<span class="icon lost-knowledge"></span>')
        .replace(/<VP>/ig, '<span class="icon vp"></span>')
        .replace(/<CITY>/ig, '<span class="icon city"></span>')
        .replace(/<MEGALITH>/ig, '<span class="icon megalith"></span>')
        .replace(/<PYRAMID>/ig, '<span class="icon pyramid"></span>')
        .replace(/<ARTIFACT>/ig, '<span class="icon artifact"></span>')
        .replace(/<ANCIENT>/ig, '<span class="icon ancient"></span>')
        .replace(/<WRITING>/ig, '<span class="icon writing"></span>')
        .replace(/<SECRET>/ig, '<span class="icon secret"></span>')
        .replace(/\[n°(\d)\]/ig, (fullMatch, number) => `<span class="icon starting-space">${number}</span>`);
}