import { process } from '/env'
import { Configuration, OpenAIApi } from 'openai'


const setupInputContainer = document.getElementById('setup-input-container')
const movieBossText = document.getElementById('movie-boss-text')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

document.getElementById("send-btn").addEventListener("click", () => {
  const setupTextarea = document.getElementById('setup-textarea')
  if (setupTextarea.value) {
    const userInput = setupTextarea.value;
    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`
    movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`
    fetchBotReply(userInput)
    fetchSynopsis(userInput)
  }
  
})

async function fetchBotReply(outline) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate a short message to enthusiastically say an outline sounds interesting and that you need some minutes to think about it.
    ###
    outline: Two dogs fall in love and move to Hawaii to learn to surf.
    message: I'll need to think about that. But your idea is amazing! I love the bit about Hawaii!
    ###
    outline: A plane crashes in the jungle and the passengers have to walk 1000km to safety.
    message: I'll spend a few moments considering that. But I love your idea!! A disaster movie in the jungle!
    ###
    outline:${outline}
    message:
    `,
    max_tokens:60
  })
  movieBossText.innerText = response.data.choices[0].text.trim()
  // console.log(response)
}

async function fetchSynopsis(outline){
  const response = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Generate an engaging, professional and marketable movie synopsis based on an outline. Think about what actors who have never played a character in star wars movies might be good for each character and place brackets around the actors name after introducing a new character. 
    ###
    outline: A big-headed daredevil fighter pilot goes back to school only to be sent on a deadly mission.
    synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
    ###
    outline: ${outline}
    synopsis: 
    `,
    max_tokens:240
  })
  const synopsis = response.data.choices[0].text.trim()
  document.getElementById('output-text').innerText = response.data.choices[0].text.trim()
  fetchTitle(synopsis)
  fetchStars(synopsis)
}

async function fetchTitle(synopsis){
  const response = await openai.createCompletion({
    model:'text-davinci-003',
    prompt:`Write an intriguing title based on the synopsis
    ###
    synopsis:The greatest trick the devil ever pulled was convincing the world he didn't exist," says con man Kint (Kevin Spacey), drawing a comparison to the most enigmatic criminal of all time, Keyser Soze. Kint attempts to convince the feds that the mythic crime lord not only exists, but is also responsible for drawing Kint and his four partners into a multi-million dollar heist that ended with an explosion in San Pedro Harbor - leaving few survivors.
    title: The Usual Suspects
    ###
    synopsis:${synopsis}
    title:
    `,
    max_tokens:25,
    temperature:.9
  })
  const title = response.data.choices[0].text.trim()
  fetchImagePrompt(title, synopsis)
  document.getElementById('output-title').innerText = title
}

async function fetchStars(synopsis){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate a response of all the stars listed in brackets
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
    `,
    max_tokens: 30
  })
  document.getElementById('output-stars').innerText = response.data.choices[0].text.trim()
}

async function fetchImagePrompt(title, synopsis){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Give a short description of an image which could be used to advertise a movie based on a title and synopsis. The description should be rich in visual detail but contain no names.
    ###
    title: zero Earth
    synopsis: When bodyguard Kob (Daniel Radcliffe) is recruited by the United Nations to save planet Earth from the sinister Simm (John Malkovich), an alien lord with a plan to take over the world, he reluctantly accepts the challenge. With the help of his loyal sidekick, a brave and resourceful hamster named Gizmo (Gaten Matarazzo), Kob embarks on a perilous mission to destroy Simm. Along the way, he discovers a newfound courage and strength as he battles Simm's merciless forces. With the fate of the world in his hands, Kob must find a way to defeat the alien lord and save the planet.
    image description: A tired and bloodied bodyguard and hamster standing atop a tall skyscraper, looking out over a vibrant cityscape, with a rainbow in the sky above them.
    ###
    title: ${title}
    synopsis: ${synopsis}
    image description: 
    `,
    temperature: 0.8,
    max_tokens: 100
  })
  const imagePromt = response.data.choices[0].text.trim()
  // console.log(imagePromt)
  generateImage(imagePromt)
}

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
    movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`
  })
}

//prompt
// The Sith Empire has infiltrated the educational system all across the galaxy 
// to indoctrinate children into losing connection with the force. This has left the 
// world with one lone jedi who must find a way to reawaken the force and overthrow the 
// Sith empire.

// In a galaxy far, far away, the Sith Emperor has brought an era of darkness, 
// having skilled his army of indoctrinated children to be disconnected from the Force. 
// Without the power of the Jedi Knights, the future of the galaxy is shrouded in peril. 
// Luke Skywalker (Mark Hamill) is the last remaining Jedi, and he has taken on the 
// desperate mission of awakening the Force within the children, restoring their connection 
// to the light side of the Force, and protecting them from the Sith Emperor's forces. 
// With the help of his courageous allies, including Han Solo (Harrison Ford) and Princess 
// Leia (Carrie Fisher), Luke embarks on a thrilling quest to awaken this power, confront the 
// Dark Side, and protect the future of the galaxy. Together, they'll battle droids, overcome 
// dangers and discover the true power of the Force in order to save the galaxy from the 
// grip of the Sith Emperor.