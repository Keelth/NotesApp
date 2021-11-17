const express = require('express');
const router = express.Router();

const Note = require('../models/Note');
const { isAuthenticated } = require('../helpers/auth')

router.get('/notes/add', isAuthenticated, (req,res) => {
    res.render('notes/add');
});

router.post('/notes/add', isAuthenticated, async (req,res) => {
    const { title, description } = req.body;
    const errors = [];
    if(!title){
        errors.push( {text: 'Please write a title'} );
    
    }
    if (!description){
        errors.push( {text: 'Please write a Description'} );
    }
    if(errors.length > 0){
        res.render('notes/add', {
            errors,
            title,
            description
        });
    }else{
        const newNote = new Note( {title, description} );
        newNote.user = req.user.id;
        await newNote.save();
        req.flash('success_msg', 'Note added successfully.');
        res.redirect('/notes');
    }
})

router.get('/notes', isAuthenticated, async (req,res) => {
    const notes = await Note.find({user: req.user.id})
        .sort({date: 'desc'})
        .lean();
    res.render('notes/all', { notes });
});

router.get('/notes/edit/:id', isAuthenticated, async (req,res) => {
    const note = await Note.findById(req.params.id)
        .lean();
    res.render('notes/edit', { note });
});

router.put('/notes/edit/:id', isAuthenticated, async (req,res) => {
    const { title, description } = req.body;
    await Note.findByIdAndUpdate(req.params.id, { title, description });
    req.flash('success_msg', 'Note edited successfully.');
    res.redirect('/notes');
});

router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Note removed successfully.');
    res.redirect('/notes');
});

module.exports = router;