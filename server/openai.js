const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API,
    organization: 'org-7w7AKzZn6SDSY9GXWBNuX4pj'
});

const descExJson = {
    charities: [
        {
            description: '',
            name: '',
            category: ''
        }
    ]
}

const getDescriptions = async (charityList) => {
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: `Provide output in valid JSON which looks like this: ${JSON.stringify(descExJson, null, 4)}. You get descriptions of charities and categorize them into food, health, education or other.` },
            { 
                role: 'user',
                content: `Provide output in valid JSON, generate a small two sentence description of these charities: ${charityList.join(', ')}. ` +
                    `And separately categorize them into food, health, education or other.`
            },
        ]
    });
    return completion.choices[0].message.content;
}

module.exports = {
    getDescriptions
};
