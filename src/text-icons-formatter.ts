function formatTextIcons(rawText: string) {
    if (!rawText) {
        return '';
    }
    return rawText
    .replace(/\[Heat\]/ig, '<div class="heat icon"></div>')
    .replace(/\[Cooldown\]/ig, '<div class="cooldown icon"></div>')
    .replace(/\[Speed\]/ig, '<div class="speed icon"></div>')
    .replace(/\[Boost\]/ig, '<div class="boost icon"></div>')
    .replace(/\[\+\]/ig, '<div class="boost icon"></div>');
}