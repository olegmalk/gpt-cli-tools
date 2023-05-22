export function createDocumentationPrompt(code: string, isTypeScript: boolean): string {
    const language = isTypeScript ? "TypeScript" : "JavaScript";
    const annotations = isTypeScript ? "type annotations" : "JSDoc comments";

    const prompt = `
I have the following ${language} code file:

----------------------------------------
${code}
----------------------------------------

I would like you to write detailed documentation and ${annotations} for it. Make variable and function names more clear and easier to understand.  Do NOT change the underlying code logic itself, only add the documentation and ${annotations}.

Respond ONLY with the code file with the documentation added, and nothing else. Do not respond with any other text.
    `;
    return prompt
}

export function createConversionPrompt(code: string, isTypeScript: boolean): string {
    const language = isTypeScript ? "TypeScript" : "JavaScript";

    const prompt = `
I have the following ${language} code file:

----------------------------------------
${code}
----------------------------------------

I would like you to convert this code to working TypeScript and write detailed documentation and type annotations for it. Make variable and function names more clear and easier to understand.  Do NOT change the underlying code logic itself, only convert it to TypeScript and add the documentation and type annotations.

Respond ONLY with the TypeScript code file with the documentation added, and nothing else. Do not respond with any other text.
    `;
    return prompt
}

export function createRefactorPrompt(code: string, isTypeScript: boolean): string {
    const language = isTypeScript ? "TypeScript" : "JavaScript";
    const annotations = isTypeScript ? "type annotations" : "JSDoc comments";

    const prompt = `
I have the following ${language} code file:

----------------------------------------
${code}
----------------------------------------

I would like you to refactor this code to improve performance, functionality, modularity, and maintainability. Write detailed documentation and ${annotations} for it. Make variable and function names more clear and easier to understand.  Do NOT change the underlying code logic itself, but make it faster, better, easier to understand, and easier to maintain.

Respond ONLY with the ${language} code file with changes requested, and nothing else. Do not respond with any other text.
    `;
    return prompt
}