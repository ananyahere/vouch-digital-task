const router = require("express").Router()
const Contact = require('../model/contact')
const isAuth = require('../middleware/isAuth')

// add new contact
router.post("/contact", isAuth, async (req, res) => {
  const contact = new Contact({
    ...req.body,
    owner: req.user._id,
  });
  try{
   await contact.save()
   res.status(201).send(contact)
  }catch(e){
    res.status(400).send({error:e})
  }
})

// add contact bulk
router.post("/contacts",isAuth, async (req,res) => {
  const contactsArr = req.body
  try{
    const contacts = []
    // modify each contact and store in contacts 
    // modified version of ForEach loop for async function
    for(const contact of contactsArr){
      const newContact = new Contact({
        ...contact,
        owner: req.user._id
      })
      contacts.push(newContact)
    }
    // insert all to db 
    console.log(contacts)
    await Contact.insertMany(contacts)
    res.status(201).send(contacts)
  }catch(e){
    res.status(400).send({error:e})
  }
})

// read given contact 
router.get("/contacts/:id",isAuth, async (req, res)=>{
  const _id = req.params.id.trim()
  try{
    const contact = await Contact.findOne({_id, owner: req.user._id})
    if(!contact) 
      return res.status(404).send({error: `No contact with id ${_id} found`})
    res.status(200).send(contact)
  }catch(e){
    res.status(400).send({error:e})
  }
})

// fetch the list of contacts with pagination
// GET /contacts?limit=4
router.get("/contacts",isAuth , async (req,res) => {
  // parse req.query.limit (which is string) to int
  const limit = parseInt(req.query.limit.trim())
  // find all the contacts of logged in user
  try{
    const tasks = await req.user.populate({
      path:'contacts',
      options: { limit }
    })
    res.status(200).send(tasks)
  }catch(e){
    console.log(e)
    res.status(400).send({error:e})
  }
})

// delete given contact
router.delete("/contact/:id",isAuth,async (req, res) => {
  const _id= req.params.id
  try{
    const contact = await Contact.findOneAndDelete({_id, owner: req.user._id})
    if(!contact) 
      return res.status(404).send({error: `No contact with id ${_id} found`})
    res.status(200).send(`contact  with ${_id} deleted`)
  }catch(e){
    res.status(400).send({error:e})
  }
})


// update given contact
router.patch("/contact/:id", isAuth, async (req, res)=> {
  const _id = req.params.id
  const desiredUpdates = Object.keys(req.body)
  try{
    const contact = await Contact.findOne({_id, owner: req.user._id})
    if(!contact)
      return res.status(404).send({error: `No contact with id ${_id} found`})
    desiredUpdates.forEach(update => {
      contact[update] = req.body[update]
    })
    await contact.save()
    res.status(200).send(contact)
  }catch(e){
    res.status(400).send({error:e})
  }
})

module.exports = router