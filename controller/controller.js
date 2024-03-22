
const User = require('../models/players');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // for generating JWT tokens

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(username);
    console.log(password);
    // Find the user by username
    const user = await User.findOne({ username:username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token for authentication
    const token = jwt.sign({ userId: user._id }, 'remed123', { expiresIn: '1h' }); // Change 'your_secret_key' to your actual secret key

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.addPlayer = async (req, res, next) => {
  try {
    const { username, registrationNumber, password, secure, level, tokens } = req.body;

    // Check if the username or registration number already exist
    const existingUser = await User.findOne({ $or: [{ username }, { registrationNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or registration number already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // You can adjust the salt rounds as needed

    // Create a new user object
    const newUser = new User({
      username,
      registrationNumber,
      password: hashedPassword,
      secure: secure || false,
      level: level || 0,
      tokens: tokens || 50,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.stealTokens = async (req, res, next) => {
    try {
        const { username, player } = req.body;

        const [player1Data, player2Data] = await Promise.all([
            User.findOne({ username: username}),
            User.findOne({ username: player })
        ]);

        if(username==player)
        {
          return res.status(404).json({ message: 'Cannot attck yourself' });
        }


        if (!player1Data || !player2Data) {
            return res.status(404).json({ message: 'Server not found' });
        }


        if (!player2Data.secure && player2Data.tokens>=5 && player2Data.level<10) {
            player1Data.tokens += 5;
            player2Data.tokens -= 5;
            player1Data.secure=false;

            await Promise.all([
                player1Data.save(),
                player2Data.save()
            ]);

            return res.status(200).json({ message: 'Tokens stolen successfully' });
        } else {
            return res.status(400).json({ message: 'Cannot steal tokens' });
        }
    } catch (error) {
        console.error('Error stealing tokens:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.secureDb= async (req, res, next) => {
    try {
      const { player } = req.body;
      const playerData = await User.findOne({ username: player });
      if (!playerData) {
        return res.status(404).json({ message: 'Player not found' });
      }
      playerData.secure = true;
      await playerData.save();
  
      res.status(200).json({ message: 'Secure field updated successfully', player: playerData });
    } catch (error) {
      console.error('Error updating secure field:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  exports.getPlayerL = async (req, res, next ) => {
    try {
      const { username } = req.body;
      const playerData = await User.findOne({ username: username });
  
      if (!playerData) {
        return res.status(404).json({ message: 'Player not found' });
      }
      const { level } = playerData;
      res.status(200).json({ level });
    } catch (error) {
      console.error('Error updating secure field:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.updatePlayer=async (req, res, next) => {
    try {
      const { username } = req.body;
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.level = user.level + 1;
      await user.save();
      res.status(200).json({ message: 'Player level updated successfully' });
    } catch (error) {
      console.error('Error updating player level:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.getPlayers=async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


  