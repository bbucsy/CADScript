import { SimpleGeometryDescription } from "@cadscript/shared";
import { Model } from "../generated/ast.js";
import { SimpleGeometryDescriptionBuilder } from "../utils/cad-script-model-builder.js";

export class SGDBuilderService {
  constructor() {}

  public processModel(model: Model): SimpleGeometryDescription | undefined {
    const builder = SimpleGeometryDescriptionBuilder.process(model);
    return builder.getDescription();
  }
}
