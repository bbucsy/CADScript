import { isPoint, type Model } from '../language/generated/ast.js';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { extractDestinationAndName } from './cli-util.js';
import { CompositeGeneratorNode, NL, toString } from 'langium';

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.gen`;

    const fileNode = new CompositeGeneratorNode();
    fileNode.append('"Generation:";', NL, NL);

    model.sketch?.statements.forEach((stmt) =>{
        fileNode.append('Statement: ', NL)

        if(isPoint(stmt)){

            fileNode.indent(indent =>{

                indent.append(stmt.name, NL)
                
                indent.append(stmt.place?.placeType, NL )

                if(stmt.place?.xBase){
                    indent.append(stmt.place.xBase.value.toString(), ' ' ,stmt.place.xBase.unit, NL)
                }

            })


        }


    })


    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}
