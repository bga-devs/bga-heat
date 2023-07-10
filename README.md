# What is this project ? 
This project is an adaptation for BoardGameArena of game Heat edited by Days of Wonder.
You can play here : https://boardgamearena.com

# How to install the auto-build stack

## Install builders
Intall node/npm then `npm i` on the root folder to get builders.

## Auto build JS and CSS files
In VS Code, add extension https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave and then add to config.json extension part :
```json
        "commands": [
            {
                "match": ".*\\.ts$",
                "isAsync": true,
                "cmd": "npm run build:ts"
            },
            {
                "match": ".*\\.scss$",
                "isAsync": true,
                "cmd": "npm run build:scss"
            }
        ]
    }
```
If you use it for another game, replace `heat` mentions on package.json `build:scss` script and on tsconfig.json `files` property.

## Auto-upload builded files
Also add one auto-FTP upload extension (for example https://marketplace.visualstudio.com/items?itemName=lukasz-wronski.ftp-sync) and configure it. The extension will detected modified files in the workspace, including builded ones, and upload them to remote server.

## Hint
Make sure ftp-sync.json and node_modules are in .gitignore

# Rules
TODO

je t'ai mis des fichiers dans misc avec les données pour USA et Italia
les positions x,y sont définies par rapport à la viewBox du svg associé que je t'ai mis aussi dans misc
je sais pas trop pourquoi mais les échelles sont assez différentes entre les deux circuits
les datas c'est un objet avec comme keys les ids des paths dans le svg, ce qui permet d'identifier de manière unique chaque cell, et c'est ça que je t'enverrais pour la position d'une car, et un champs 'a' qui correspond à l'angle pour la direction
sachant que dans l'éiteur, pour avoir les flèches bien orientées, je fais juste :   $(direction-${cellId}).style.transform = rotate(${angle}deg);
à partir d'une flèche horizontale vers la droite
donc faudra juste chopper les assets des voitures dans cette direction, ou adapter le code