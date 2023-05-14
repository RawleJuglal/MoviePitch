import { process } from '/env'
import { Configuration, OpenAIApi } from 'openai'

const setupInputContainer = document.getElementById('setup-input-container')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

document.getElementById("send-btn").addEventListener("click", async () => {
  const setupTextarea = document.getElementById('setup-textarea')
  if (setupTextarea.value) {
    const userInput = setupTextarea.value;
    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`
    renderWithResponse('movie-boss-text',`Ok, just wait a second while my digital brain digests that...` )
   
    const qPrompt = `Generate a short message to enthusiastically say an outline sounds interesting and that you need some minutes to think about it.
    ###
    outline: Two dogs fall in love and move to Hawaii to learn to surf.
    message: I'll need to think about that. But your idea is amazing! I love the bit about Hawaii!
    ###
    outline: A plane crashes in the jungle and the passengers have to walk 1000km to safety.
    message: I'll spend a few moments considering that. But I love your idea!! A disaster movie in the jungle!
    ###
    outline:${userInput}
    message:
    `
    const qResponse = await callForCompletion(qPrompt, 60, null)
    renderWithResponse('movie-boss-text', qResponse.data.choices[0].text.trim())

    const sPrompt = `Generate an engaging, professional and marketable movie synopsis based on an outline. Think about what actors who have never played a character in star wars movies might be good for each character and place brackets around the actors name after introducing a new character. 
    ###
    outline: A big-headed daredevil fighter pilot goes back to school only to be sent on a deadly mission.
    synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
    ###
    outline: ${userInput}
    synopsis: 
    `
    const sResponse = await callForCompletion(sPrompt, 240, null)
    const synopsis = sResponse.data.choices[0].text.trim()
    renderWithResponse('output-text', synopsis)

    const tPrompt = `Write an intriguing title based on the synopsis
    ###
    synopsis:The greatest trick the devil ever pulled was convincing the world he didn't exist," says con man Kint (Kevin Spacey), drawing a comparison to the most enigmatic criminal of all time, Keyser Soze. Kint attempts to convince the feds that the mythic crime lord not only exists, but is also responsible for drawing Kint and his four partners into a multi-million dollar heist that ended with an explosion in San Pedro Harbor - leaving few survivors.
    title: The Usual Suspects
    ###
    synopsis:${synopsis}
    title:
    `
    const tResponse = await callForCompletion(tPrompt, 25, .9)
    const title = tResponse.data.choices[0].text.trim()
    renderWithResponse('output-title', title)

    const stPrompt = `Generate a response of all the stars listed in brackets
    ###
    synopsis:In a galaxy far, far away, the Sith Emperor has brought an era of darkness, 
    having skilled his army of indoctrinated children to be disconnected from the Force. 
    Without the power of the Jedi Knights, the future of the galaxy is shrouded in peril. 
    Luke Skywalker (Mark Hamill) is the last remaining Jedi, and he has taken on the 
    desperate mission of awakening the Force within the children, restoring their connection 
    to the light side of the Force, and protecting them from the Sith Emperor's forces. 
    With the help of his courageous allies, including Han Solo (Harrison Ford) and Princess 
    Leia (Carrie Fisher), Luke embarks on a thrilling quest to awaken this power, confront the 
    Dark Side, and protect the future of the galaxy. Together, they'll battle droids, overcome 
    dangers and discover the true power of the Force in order to save the galaxy from the 
    grip of the Sith Emperor.
    stars: Mark Hamill, Harrison Ford, Carrie Fisher
    ###
    synopsis:${synopsis}
    stars:
    `
    const stResponse = await callForCompletion(stPrompt, 30, null)
    renderWithResponse('output-stars', stResponse.data.choices[0].text.trim())

    const iPrompt = `Give a short description of an image which could be used to advertise a movie based on a title and synopsis. The description should be rich in visual detail but contain no names.
    ###
    title: zero Earth
    synopsis: When bodyguard Kob (Daniel Radcliffe) is recruited by the United Nations to save planet Earth from the sinister Simm (John Malkovich), an alien lord with a plan to take over the world, he reluctantly accepts the challenge. With the help of his loyal sidekick, a brave and resourceful hamster named Gizmo (Gaten Matarazzo), Kob embarks on a perilous mission to destroy Simm. Along the way, he discovers a newfound courage and strength as he battles Simm's merciless forces. With the fate of the world in his hands, Kob must find a way to defeat the alien lord and save the planet.
    image description: A tired and bloodied bodyguard and hamster standing atop a tall skyscraper, looking out over a vibrant cityscape, with a rainbow in the sky above them.
    ###
    title: ${title}
    synopsis: ${synopsis}
    image description: 
    `
    const iResponse = await callForCompletion(iPrompt, 100, .8)
    const imagePromt = iResponse.data.choices[0].text.trim()

    generateImage(imagePromt)
  }
  
})

async function generateImage(prompt) {
  const response = await openai.createImage({
    prompt: `${prompt}. There should be no text in this image.`,
    n: 1,
    size: '512x512',
    response_format: 'b64_json'
  })
  document.getElementById('output-img-container').innerHTML = `<img src="data:image/png;base64,${response.data.data[0].b64_json}">`
  setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`
  document.getElementById('view-pitch-btn').addEventListener('click', ()=>{
    document.getElementById('setup-container').style.display = 'none'
    document.getElementById('output-container').style.display = 'flex'
    renderWithResponse('movie-boss-text', `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`)
  })
}

function renderWithResponse(element, data){
  document.getElementById(element).innerText = data
}

async function callForCompletion(textPrompt, tokens, temp ){
    return await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: textPrompt,
    temperature:temp != null? temp : 1,
    max_tokens: tokens != null? tokens : 16,
  })
}
