import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { CadScriptAstType, Person } from './generated/ast.js';
import type { CadScriptServices } from './cad-script-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: CadScriptServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.CadScriptValidator;
    const checks: ValidationChecks<CadScriptAstType> = {
        Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class CadScriptValidator {

    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }

}
