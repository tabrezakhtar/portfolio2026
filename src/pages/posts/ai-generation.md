---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Adding AI Generation to RiffTales'
pubDate: 2026-09-12
description: 'Using OpenRouter and an OpenAI-compatible API to generate equipment descriptions for RiffTales.'
author: 'Tabrez Akhtar'
tags: ["AI", "OpenRouter", "OpenAI", "Node.js", "React", "RiffTales"]
---

<lite-youtube videoid="4q7l-bIRJAI" title="RiffTales AI Equipment Description Generator" playlabel="Play the RiffTales AI equipment description video"></lite-youtube>

One of the things I want to make easier on <a href="https://rifftales.net" target="_blank" rel="noreferrer">RiffTales</a> is for users to add their instruments as easily as possible.

Sometimes knowing what to write can be difficult, and its nice to have a starting point.

So I decided to add an AI-generated description feature.

The idea is quite simple: the user fills in as much information as they can on the **Add Equipment** screen, and that information is sent to an LLM. The LLM generates a description and sends it back to the UI, where the user can review and edit it before saving.

### The basic flow

The process looks like this:

```text
User enters equipment details
          ↓
React UI sends the information to the API
          ↓
Node.js builds the request
          ↓
OpenRouter sends it to an LLM
          ↓
Generated description is returned to the API
          ↓
Description is displayed in the UI
```

The AI can research the product as well as use the information provided by the user. If the user enters a 1998 Fender Stratocaster, for example, the model can use product information alongside the user's notes to create a more complete description.

### Using OpenRouter

For this feature I'm using <a href="https://openrouter.ai" target="_blank" rel="noreferrer">OpenRouter</a>.

I installed the OpenAI Node.js library, a common library for connecting applications to LLMs:

```json
"openai": "7.15.0"
```

```js
const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY
});
```

OpenRouter provides an OpenAI-compatible API, so I can use the library I already know and point it at OpenRouter.

### OpenRouter presets

An OpenRouter preset is a saved set of model settings and instructions for a specific task. The application can reference the preset when making a request instead of including all of those instructions in its code.

For this feature, I created a preset called `equipment-description-generator`:

The preset tells the model to research the equipment, use the user's notes, and write in a personal style:

```text
You are writing a personal description of a piece of musical equipment for its owner.

Write as if YOU ARE THE OWNER of the equipment, sharing it with other musicians and music enthusiasts on a social platform.

The user has provided information about their equipment. Use that information to create a natural, engaging first-person description.

Rules:

* Write in the first person ("I", "my", "me").
* Sound like a real musician talking about their own equipment.
* Be warm, personal and conversational rather than sounding like a product catalogue, advert or manufacturer description.
* Focus on what makes this particular piece of equipment interesting to its owner.
...
...
* Do not return the description as one large block of text.
* Do not use Markdown headings, bullet points or numbered lists.
* Return plain text with paragraph breaks using newline characters.
* Each paragraph should contain a coherent part of the story, rather than splitting sentences arbitrarily.

Use the user's information alongside reliable product research, and do not invent unsupported claims.
```

### Building the equipment information

On the backend, I take the information from the equipment object and turn the available fields into a simple block of text:

```js
function buildEquipmentPrompt(equipment) {
  const {
    type,
    brand,
    why,
    description
  } = equipment || {};

  const details = [
    type && `Type: ${type}`,
    brand && `Brand: ${brand}`,
    why && `Why it's special: ${why}`,
    description && `Existing notes: ${description}`
  ]
    .filter(Boolean)
    .join("\n");

  return `Write a short, engaging description (2-4 sentences) for the following piece of music gear, to be shown on a gear collector's profile. Write in a natural, human tone. Only return the description text, no headings or extra commentary.

${details}`;
}
```

The React application only needs to send the equipment data to the API.

### Calling the model

The actual OpenRouter request is fairly small:

```js
async function generateEquipmentDescription(equipment) {
  if (!client) {
    throw new Error("Missing OPENROUTER_API_KEY in environment");
  }

  const model = process.env.OPENROUTER_MODEL
    ? `${process.env.OPENROUTER_MODEL}@preset/equipment-description-generator`
    : "@preset/equipment-description-generator";

  const apiResponse = await client.chat.completions.create({
    model,
    messages: [{
      role: "user",
      content: buildEquipmentPrompt(equipment)
    }]
  });

  return apiResponse.choices[0]?.message?.content?.trim() || "";
}
```

The model value tells OpenRouter to use the preset, while the message content contains the user's equipment information.

### Authentication and rate limiting

I didn't want this endpoint to be freely available to anyone because every generation request involves an external API call.

The feature is therefore only available to logged-in RiffTales users.

I also added rate limiting to the endpoint to prevent someone from repeatedly hitting the generation API.

This is an important consideration with AI features. Even if the feature itself is simple, you still need to think about who can call it and how often.

### Wiring it up to React

Once the backend was working, it was mostly a matter of wiring it up to the UI.

The React code sends the current equipment data to the API:

```js
const generateDescription = async (equipmentData = null) => {
  const dataToSend = equipmentData || equipment;

  setError(null);

  try {
    const response = await fetch(
      `${BASE_URL}/api/equipment/generateDescription`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(dataToSend),
        credentials: "include",
      }
    );

    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(
        "Failed to generate description. Please try again later."
      );
    }

    return result.description;
  } catch (error) {
    setError(error.message);
    throw error;
  }
};
```

The generated description is then returned to the UI.

The user can look at the result, make any changes they want and then save it as part of their equipment listing.

### The result

I enjoyed building this feature. It makes adding equipment to RiffTales much easier.

I also found OpenRouter really easy to work with, and I’ll be looking at other ways to use it across the app.

You can check it out on <a href="https://rifftales.net" target="_blank" rel="noreferrer">RiffTales</a>.
