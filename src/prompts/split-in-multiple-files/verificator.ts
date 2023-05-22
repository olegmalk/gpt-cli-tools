import { THINKING_DELIMETER } from "../delimeters";
import { PROJECT_GUIDELINES } from "../generic/project-guidelines";
import { PromptType } from "../prompt.type";
import { ANALYZE_FILES_TASK } from "./analyze-files";
import { PROBLEM_SOLVING_SYSTEM_MESSAGE } from "./problem-solving-system";
import { splitSystemMessage } from "./system";

export function createSplitIntoMultipleFilesVerificatorPrompt(props: {
    code: string,
    isTypeScript: boolean,
    filePath: string
    solution: string,
}): PromptType {
    const language = props.isTypeScript ? "TypeScript" : "JavaScript";

    const system = `You are a verificator who is checking the correctness of following the instructions and fixing the issues in the solution if any.
    ${PROBLEM_SOLVING_SYSTEM_MESSAGE}
    `;

    const user = `
System:
${splitSystemMessage}


Original file in language ${language} at path "${props.filePath}":
${props.code}

Original task:
${ANALYZE_FILES_TASK}
(do not do it, it is for the purpose of understanding the problem)

Solution to be verified (Format: {absolute_file_path} - {export_name}):
${props.solution}

Your job is to verify that task above is following the guidelines and requirements.
${PROJECT_GUIDELINES}

For each requirement or guideline output "PASS" if it is followed correctly or "FAIL" if it is not followed correctly
use following format:
- {guideline_id}. {PASS_or_FAIL}

After ${THINKING_DELIMETER} output the correct solution and nothing else. Do not explain or comment after ${THINKING_DELIMETER}.

Output format:
{replace_with_reasoning_for_fixing_the_solution}
${THINKING_DELIMETER}
{replace_with_correct_solution}


`;
    return { user, system }
}
