import { type Module, inject } from 'langium';
import { createDefaultModule, createDefaultSharedModule, type DefaultSharedModuleContext, type LangiumServices, type LangiumSharedServices, type PartialLangiumServices } from 'langium/lsp';
import { CadScriptGeneratedModule, CadScriptGeneratedSharedModule } from './generated/module.js';
import { CadScriptValidator, registerValidationChecks } from './features/cad-script-validator.js';
import { CadScriptExpansionService } from './features/cad-script-expansion.js';
import { MeasurementCompuitation } from './features/cad-script-measurement.js';
import { InterpolatedIdScopeComputation } from './features/cad-script-scope.js';


/**
 * Declaration of custom services - add your own service classes here.
 */
export type CadScriptAddedServices = {
	validation: {
		CadScriptValidator: CadScriptValidator
	}
	modelBuilder: {
		modelExpander: CadScriptExpansionService
	}
	expressions: {
		UnitConverter: MeasurementCompuitation
	}
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type CadScriptServices = LangiumServices & CadScriptAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */

export const CadScriptModule: Module<CadScriptServices, PartialLangiumServices & CadScriptAddedServices> = {
	validation: {
		CadScriptValidator: () => new CadScriptValidator()
	},
	references: {
		ScopeComputation: services => new InterpolatedIdScopeComputation(services)
	},
	modelBuilder: {
		modelExpander: services => new CadScriptExpansionService(services),
	},
	expressions: {
		UnitConverter: services => new MeasurementCompuitation(services)
	}
}


/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createCadScriptServices(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    CadScript: CadScriptServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        CadScriptGeneratedSharedModule
    );
    const CadScript = inject(
        createDefaultModule({ shared }),
        CadScriptGeneratedModule,
        CadScriptModule
    );
    shared.ServiceRegistry.register(CadScript);
    registerValidationChecks(CadScript);
    return { shared, CadScript };
}