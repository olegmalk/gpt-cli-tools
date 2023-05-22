import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from "openai";
/**
 * Importing the prompts file to get the methods that generate prompts and fetch responses from GPT
 */
import { createDocumentationPrompt, createConversionPrompt, createRefactorPrompt } from './prompts';

/**
 * Importing the file system and path libraries to read and write files to the system
 */
import * as fs from 'fs';
import * as path from 'path';
import { createSplitIntoMultipleFilesPrompts } from './prompts/split-in-multiple-files/split';
import { OpenAI } from "openai-streams";
import { yieldStream } from "yield-stream";
import { encode } from "gpt-tokenizer";
import { DELIMETER_FOR_FILES, DELIMETER_BETWEEN_FILEPATH_AND_FILE_CONTENT, THINKING_DELIMETER } from "./prompts/delimeters";
import { createSplitIntoMultipleFilesAnalyzeFilePrompt } from "./prompts/split-in-multiple-files/analyze-files";
import { createSplitIntoMultipleFilesVerificatorPrompt } from "./prompts/split-in-multiple-files/verificator";
import { createUnitTestPrompt } from "./prompts/write-tests/write-tests";

/**
 * Sends a query to OpenAI API endpoint to get a response with generated code
 * @param query The prompt string to be sent to OpenAI API
 * @param apiKey The API key to access GPT
 * @returns A Promise with a string response containing the generated code
 */
async function queryGPT(props: {user: string, apiKey: string, system?: string, id: string}): Promise<string> {
  console.log('initiating queryGPT for', props.id);
  const messages: Array<ChatCompletionRequestMessage> = [];

  if (props.system) {
    messages.push({role: ChatCompletionRequestMessageRoleEnum.System, content: props.system});
  }

  const thread = process.env.THREAD || '';

  const progresFileName = `progress-${props.id}${thread ? '-' + thread : ''}.txt`;

  const progress = fs.existsSync(progresFileName) ? fs.readFileSync(progresFileName, 'utf8') : '';

  const completedFileName = `progress-${props.id}${thread ? '-' + thread : ''}.completed`;

  if (fs.existsSync(completedFileName)) {
    return progress;
  }

  messages.push({role: ChatCompletionRequestMessageRoleEnum.User, content: props.user});
  messages.push({role: ChatCompletionRequestMessageRoleEnum.Assistant, content: progress});

  const useGpt4 = true;

  const tokens = encode(props.system + ' ' + props.user + ' ' + progress);

  const stream = await OpenAI("chat", {
    model: useGpt4 ? 'gpt-4' : "gpt-3.5-turbo",
    messages,
    max_tokens: useGpt4 ? (8192 - tokens.length) : 3000,
  }, { apiKey: props.apiKey });

  // Convert Uint8Array to string
  const decoder = new TextDecoder();

  let result = progress;
  console.log('Streaming the response from OpenAI API...');
  for await (const chunk of yieldStream(stream)) { 
    const str = decoder.decode(chunk);
    result += str;
    
    // write result to file doing global replace of \n on result with new line
    fs.writeFileSync(progresFileName, result.replace(/\\n/g, '\n'));
  }
  console.log('Finished streaming the response from OpenAI API');

  fs.writeFileSync(completedFileName, '');

  return result;
}

/**
 * Generates documentation for given TypeScript or JavaScript code and saves it as a new file with a "_modified" suffix
 * @param parsedArguments An object containing parsed command line arguments
 * @param code A string containing the code to be documented
 * @returns A Promise with void
 */
export async function documentCode(parsedArguments: any, code: string): Promise<void> {
  console.log(`Generating documentation for the file ${parsedArguments.filePath}...`);
  
  // Create a prompt string to generate documentation using the input code and a boolean flag indicating whether it is TypeScript
  const user = createDocumentationPrompt(code, parsedArguments.isTypeScript);
  // Send query to OpenAI API and get the response containing the documented code
  const documentedCode = await queryGPT({user, apiKey: parsedArguments.apiKey, 'id': 'document-code'});

  // Get the original file's path, name, and extension
  const originalFilePath = parsedArguments.filePath;
  const fileDir = path.dirname(originalFilePath);
  const fileName = path.basename(originalFilePath, path.extname(originalFilePath));
  const fileExt = path.extname(originalFilePath);

  // Create the modified file path with the "_modified" suffix
  const modifiedFilePath = path.join(fileDir, `${fileName}_modified${fileExt}`);

  // Write the documented code to the modified file
  fs.writeFileSync(modifiedFilePath, documentedCode);

  console.log(`\nDocumentation generated and saved to ${modifiedFilePath}`);
}

/**
 * Converts given JavaScript code into TypeScript and saves it as a new file
 * @param parsedArguments An object containing parsed command line arguments
 * @param code A string containing the code to be converted
 * @returns A Promise with void
 */
export async function convertToTypeScript(parsedArguments: any, code: string): Promise<void> {
  console.log(`Converting the file ${parsedArguments.filePath} to TypeScript...`);

  // Check if the input file is already in TypeScript
  if (parsedArguments.isTypeScript) {
      console.log(`It seems like your file is already in TypeScript - We can make it better...`);
  }

  // Create a prompt string to convert code to TypeScript using the input code and a boolean flag indicating whether it is TypeScript
  const user = createConversionPrompt(code, parsedArguments.isTypeScript);
  // Send query to OpenAI API and get the response containing the converted code
  const convertedCode = await queryGPT({user, apiKey: parsedArguments.apiKey, 'id': 'convert-to-ts'});

  // Get the original file's path, name, and extension
  const originalFilePath = parsedArguments.filePath;
  const fileDir = path.dirname(originalFilePath);
  const fileName = path.basename(originalFilePath, path.extname(originalFilePath));

  // Create the modified file path with the ".ts" extension
  const modifiedFilePath = path.join(fileDir, `${fileName}_modified.ts`);
  // Write the converted code to the modified file
  fs.writeFileSync(modifiedFilePath, convertedCode);

  console.log(`\nConversion to TypeScript complete and saved to ${modifiedFilePath}`);
}

/**
 * Refactors given code and saves it as a new file with a "_modified" suffix with the same extension
 * @param parsedArguments An object containing parsed command line arguments
 * @param code A string containing the code to be refactored
 * @returns A Promise with void
 */
export async function refactorCode(parsedArguments: any, code: string): Promise<void> {
  console.log(`Refactoring the file ${parsedArguments.filePath}...`);

  // Create a prompt string to refactor the input code
  const user = createRefactorPrompt(code, parsedArguments.isTypeScript);
  // Send query to OpenAI API and get the response containing the refactored code
  const refactoredCode = await queryGPT({user, apiKey: parsedArguments.apiKey, 'id': 'refactor-code'});

  // Get the original file's path, name, and extension
  const originalFilePath = parsedArguments.filePath;
  const fileDir = path.dirname(originalFilePath);
  const fileName = path.basename(originalFilePath, path.extname(originalFilePath));
  const fileExt = path.extname(originalFilePath);

  // Create the modified file path with the "_modified" suffix and the same extension
  const modifiedFilePath = path.join(fileDir, `${fileName}_modified${fileExt}`);
  // Write the refactored code to the modified file
  fs.writeFileSync(modifiedFilePath, refactoredCode);

  console.log(`\nRefactoring complete and saved to ${modifiedFilePath}`);
}

function throwMissingFilePathError(): string {
  throw new Error('Missing file path');
}

function throwMissingFileContentsError(): string {
  throw new Error('Missing file contents');
}


const worker = async (props: {user: string, apiKey: string, system: string, id: string}) => {
    let tries = 3;
    do {
    tries--;
    // Send query to OpenAI API and get the response containing the refactored code
    const gptResponse = await queryGPT(props);

    const content = gptResponse.split(THINKING_DELIMETER)[1];
    if (!content) {
      console.log('No content found, retrying...')
      continue
    }
  
    return content;
  } while (tries);

  throw new Error('content is missing in openai response after 3 tries');
}


const split = async ({id, code, fullPath, parsedArguments, filesAndExportNames}: {id: string, code: string, fullPath: string, parsedArguments: any, filesAndExportNames: string}) => {
  // Create a prompt string to refactor the input code
  const {user, system} = createSplitIntoMultipleFilesPrompts({
    code,
    filePath: fullPath,
    isTypeScript: parsedArguments.isTypeScript,
    filesAndExportNames,
  });
  const content = await worker({user, apiKey: parsedArguments.apiKey, system, id });
  let response: {files: { filePath:string, fileContents: string }[]} = {files:[]};
  content.split(DELIMETER_FOR_FILES).map((file) => file.split(DELIMETER_BETWEEN_FILEPATH_AND_FILE_CONTENT)).forEach((file) => {
    response.files.push({
      filePath: (file[0] || throwMissingFilePathError()).trim(),
      fileContents: (file[1] || throwMissingFileContentsError()).trim(),
    });
  });
  response.files.forEach((file) => {
    fs.writeFileSync(file.filePath, file.fileContents);
  });
}


const getFilesAndExportNames = async ({code, fullPath, parsedArguments}: {code: string, fullPath: string, parsedArguments: any}) => {
  // Create a prompt string to refactor the input code
  const {user, system} = createSplitIntoMultipleFilesAnalyzeFilePrompt({
    code,
    filePath: fullPath,
    isTypeScript: parsedArguments.isTypeScript,
  });
  const content = await worker({user, apiKey: parsedArguments.apiKey, system, id: 'split-get-files-and-exports'});

  return content;
}

const verifyFilesAndExportNames = async ({code, solution, fullPath, parsedArguments}: {code: string, solution:string, fullPath: string, parsedArguments: any}) => {
  // Create a prompt string to refactor the input code
  const {user, system} = createSplitIntoMultipleFilesVerificatorPrompt({
    code,
    filePath: fullPath,
    isTypeScript: parsedArguments.isTypeScript,
    solution
  });
  const content = await worker({user, apiKey: parsedArguments.apiKey, system, id: 'verify-files-and-exports'});

  return content;
}

export async function splitCode(parsedArguments: any, code: string, fullPath: string): Promise<void> {
  console.log(`Splitting the file ${parsedArguments.filePath}...`);

  let filesAndExportNames = await getFilesAndExportNames({code, fullPath, parsedArguments});

  filesAndExportNames = await verifyFilesAndExportNames({code, fullPath, parsedArguments, solution: filesAndExportNames})

  await split({code, fullPath, parsedArguments, filesAndExportNames, id: 'split-into-multiple-files'});

  console.log(`\n Adding test-ids and splitting into multiple files complete`);
}

/**
 * Generates test cases for the input code and saves them as a new file with a ".test" suffix
 * @param parsedArguments An object containing parsed command line arguments
 * @param code A string containing the code to be tested
 * @returns A Promise with void
 */
export async function testCode(parsedArguments: any, code: string, fullPath: string): Promise<void> {
  console.log(`Testing the file ${parsedArguments.filePath}...`);

  const {user, system} = createUnitTestPrompt({code, filePath: fullPath, isTypeScript: parsedArguments.isTypeScript});

  const content = await worker({user, apiKey: parsedArguments.apiKey, system, id: 'unit-test'});

  const [testFilePath, testContent] = content.split(DELIMETER_BETWEEN_FILEPATH_AND_FILE_CONTENT).map(x => x.trim());
  
  if (!testFilePath || !testContent) {
    throw new Error('testFilePath or testContent is missing in openai response');
  }

  const testFolderPath = path.dirname(testFilePath);
  if (!fs.existsSync(testFolderPath)) {
    fs.mkdirSync(testFolderPath);
  }
  fs.writeFileSync(testFilePath, testContent);

  console.log(`\nTests generated and saved to ${testFilePath}`);

}
