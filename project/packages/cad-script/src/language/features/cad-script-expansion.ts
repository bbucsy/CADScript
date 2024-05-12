import { CadScriptServices } from '../cad-script-module.js'
import { Model } from '../generated/ast.js';
import { MeasurementCompuitation } from './cad-script-measurement.js';
import { SimpleModelDescriptionBuilder } from './smd/simple-model-builder.js';
import { SimpleDescription } from 'shared';


/**
 * Wrapper class around SimpleModelBuilder
 * so we have a single class entity to access the functionality
 */
export class CadScriptExpansionService {

    private unitConverter: MeasurementCompuitation;

    constructor(services: CadScriptServices) {
        this.unitConverter = services.expressions.UnitConverter
    }


    public expandModel(model: Model): SimpleDescription {
        const modelBuilder = new SimpleModelDescriptionBuilder(this.unitConverter);
        modelBuilder.processModel(model)
        return modelBuilder.fetchSimpleDescription();
    }

}
