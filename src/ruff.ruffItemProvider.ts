'use strict';

import {CompletionItem, CompletionItemProvider as ICompletionItemProvider} from 'vscode';
import * as fs from 'fs';


export default class RuffItemProvider implements ICompletionItemProvider
{
    public readonly filepath: string;
    public readonly encoding: string;
    protected items: CompletionItem[];
    public get count(): number
    {
        return this.items.length;
    }

    constructor(filepath: string, encoding: string = 'utf-8')
    {
        this.filepath = filepath;
        this.encoding = encoding;
        this.items = [];
    }

    public init(): Thenable<ICompletionItemProviderInitResult>
    {
        console.log(123);
        return new Promise((resolve, reject) => 
        {
            fs.readFile(this.filepath, this.encoding, (readFileError, data) => 
            {
                if (readFileError)
                {
                    resolve(<ICompletionItemProviderInitResult>{success: false, error: readFileError});
                }
                else
                {
                    try
                    {
                        this.items = JSON.parse(data);

                        resolve(<ICompletionItemProviderInitResult>{success: true, error: undefined});
                    }
                    catch (error)
                    {
                        resolve(<ICompletionItemProviderInitResult>{success: false, error: error});
                    }
                }
            });
        });
    }

    public provideCompletionItems(): CompletionItem[]
    {
        console.log(`Returning ${this.items.length} items.`);
        return this.items;
    }
}

export interface ICompletionItemProviderInitResult
{
    success: boolean;
    error: Error;
}