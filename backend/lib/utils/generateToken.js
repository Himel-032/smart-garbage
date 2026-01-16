import jwt from "jsonwebtoken";

export const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" } // token expires in 1 day
  );
};
