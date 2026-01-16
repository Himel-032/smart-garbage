import bcrypt from "bcryptjs";
const email = "himel19242@gmail.com"
const plainPassword = "123456"; // <- change this to your password
const saltRounds = 10; // standard security

const hashPassword = async () => {
  try {
    const hashed = await bcrypt.hash(plainPassword, saltRounds);
    console.log("Hashed password:", hashed);
  } catch (err) {
    console.error(err);
  }
};

hashPassword();
