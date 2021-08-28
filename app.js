require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const app = express();

app.use(express.json());

// importing user context
// const User = require("./model/user");
const Post = require("./model/post");

// Register
// app.post("/register", async (req, res) => {
//     try {
//         // Get user input
//         const { first_name, last_name, email, password } = req.body;
//         //console.log("Req.body... ", req.body);
//         // Validate user input
//         if (!(email && password && first_name && last_name)) {
//             res.status(400).send("All input is required");
//         }

//         // check if user already exist
//         // Validate if user exist in our database
//         const oldUser = await User.findOne({ email });

//         if (oldUser) {
//             return res.status(409).send("User Already Exist. Please Login");
//         }

//         //Encrypt user password
//         encryptedPassword = await bcrypt.hash(password, 10);

//         // Create user in our database
//         const user = await User.create({
//             first_name,
//             last_name,
//             email: email.toLowerCase(), // sanitize: convert email to lowercase
//             password: encryptedPassword,
//         });

//         // Create token
//         const token = jwt.sign(
//             { user_id: user._id, email },
//             process.env.TOKEN_KEY,
//             {
//                 expiresIn: "2h",
//             }
//         );
//         // save user token
//         user.token = token;

//         // return new user
//         res.status(201).json(user);
//     } catch (err) {
//         console.log(err);
//     }
// });

// Login
app.post("/login", async (req, res) => {
    try {
        // Get user input
        const { email, password, role } = req.body;

        // Validate user input
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        // const user = await User.findOne({ email });

        // if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
        const token = jwt.sign(
            { email, role },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );

        // save user token
        // user.token = token;

        // user
        res.status(200).json(token);
        // }
        // else {
        //     res.status(400).send("Invalid Credentials");
        // }
    } catch (err) {
      console.log(err);
    }
});
  
app.post("/protected", auth, (req, res) => {
    res.status(200).send("Protected path for authorized users.");
  });

app.get("/protected/posts", auth, async (req, res) => {
    const limit = req.body.limit;
    const page = req.body.page;

    try {
        console.log(limit, page);
        if (limit === null || limit === '' || page === null || page === '' ) {
            res.status(400).send("All input is required");
        }

        const posts = await Post.find().limit(limit).skip(page*limit);
            
        res.status(200).send(posts);
    } catch(err) {
        console.log(err);
        res.status(400).send("Invalid query")
    }
});

app.post("/protected/posts", auth, async (req, res) => {

    const id = { _id : req.body._id };
    const newPost = { post_text : req.body.post_text } ;
    
    try {
        const role = req.user.role;
        if (role !== 'Admin' && role !== 'admin' && role != 'ADMIN') {
            res.status(401).send("You are unauthorized");
        }

        if(id._id === null || id._id === '' || newPost.post_text === null || newPost.post_text === '') {
            res.status(400).send("All input is required");
        }

        const updatedPost = await Post.findOneAndUpdate(id, newPost);
        res.status(200).send('Post updated');

    } catch(err) {
        console.log(err);
        res.status(400).send('Couldn\'t update post');
    }
    
});

app.put("/protected/posts", auth, async (req, res) => {

    try {
        const role = req.user.role;
        if (role !== 'Admin' && role !== 'admin' && role != 'ADMIN') {
            res.status(401).send("You are unauthorized");
        }

        const post_text = req.body.post_text;
        if (post_text === null || post_text === '') {
            res.status(400).send("All input is required");
        }
        const post = new Post ({ post_text });
        const savedPost = await post.save();
        res.status(200).send('Post Created')
    } catch (err) {
        console.log(err);
        res.status(400).send('Couldn\'t add post');
    }
});

app.delete("/protected/posts", auth, async (req, res) => {
    try {
        const role = req.user.role;
        if (role !== 'Admin' && role !== 'admin' && role != 'ADMIN') {
            res.status(401).send("You are unauthorized");
        }

        const id = req.body._id;
        if(id === null || id === '') {
            res.status(400).send("All input is required");
        }

        await Post.deleteOne({ _id: req.body._id });
        res.status(200).send('Post Deleted');
    } catch (err) {
        console.log(err);
        res.status(400).send('Couldn\'t delete post');
    }

});

module.exports = app;