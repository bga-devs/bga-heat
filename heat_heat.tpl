{OVERALL_GAME_HEADER}

<div id="table-center">
    <div id="circuit"></div>
</div>
<div id="tables"></div>

<script type="text/javascript">
const URL = dojoConfig.packages.reduce((r,p) => p.name == "bgagame" ? p.location : r, null);
document.write('<script src="' + URL + '/modules/{MAP}-datas.js" type="module"><\/script>');
</script>
{OVERALL_GAME_FOOTER}
