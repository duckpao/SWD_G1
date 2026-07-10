const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nguyenducbao173@gmail.com",
    pass: "rqfs hajn gxad fwot",
  },
});

const sendActivationEmail = async (email, token) => {
  const activationLink = `http://localhost:5000/api/auth/activate?token=${token}`;

  const mailOptions = {
    from: '"Fruit Shop" <nguyenducbao173@gmail.com>',
    to: email,
    subject: "Xác thực tài khoản Fruit Shopping của bạn",
    html: `<h3>Chào mừng bạn đến với Fruit Shop!</h3>
           <p>Vui lòng click vào đường link bên dưới để kích hoạt tài khoản:</p>
           <a href="${activationLink}" style="padding: 10px 20px; background: green; color: white; text-decoration: none;">Kích hoạt tài khoản</a>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendActivationEmail };