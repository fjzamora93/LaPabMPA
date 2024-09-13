const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: message,
      oldInput: {
        email: '',
        password: ''
      },
      validationErrors: []
    });
  };

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: message,
      oldInput: {
        email: '',
        password: '',
        confirmPassword: ''
      },
      validationErrors: []
    });
  };

  exports.postLogin = async (req, res, next) => {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }

    try {
        const user = await User.findOne({ $or: [{ email: email }, { name: email }] });
        if (!user) {
            return res.status(422).json({
                success: false,
                message: 'Nombre de usuario, email o contraseñas incorrectas.',
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: []
            });
        }

        // Compara la contraseña
        const doMatch = await bcrypt.compare(password, user.password);
        if (password === user.password || doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;

            // Guarda la sesión
            await new Promise((resolve, reject) => {
                req.session.save(err => {
                    if (err) {
                        console.log('Error al guardar la sesión:', err);
                        return reject(err);
                    }
                    resolve();
                });
            });

            // Enviar respuesta JSON al frontend
            return res.redirect('/');
        } else {
            return res.status(422).json({
                success: false,
                message: 'Nombre de usuario, email o contraseñas incorrectas.',
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: []
            });
        }
    } catch (err) {
        console.log('Error en el proceso de login:', err);
        return res.status(500).json({
            success: false,
            message: 'An internal server error occurred'
        });
    }
};

  

exports.postSignup = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: email,
          name: name,
          password: password,
          confirmPassword: req.body.confirmPassword
        },
        validationErrors: errors.array()
      });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email: email,
        name: name,
        password: hashedPassword,
        cart: { items: [] }
      });
      await user.save();
      return res.redirect('/login');
    } catch (err) {
      console.log('Error al registrar el usuario:', err);
      return res.redirect('/signup');
    }
  };
  

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};






//TODO: Implementación de recuperación de cuentas

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};


exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
      })
      .catch(err => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
    });
};
