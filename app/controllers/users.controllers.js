const model = require("../model/pm_manager.model");

exports.findByNickname = async nickname => {
  const connection = await model.getConnection();
  const [rows] = await connection.execute('SELECT * FROM `Usuarios` WHERE `nickname` = ?',[nickname]);
  connection.end();
  if (rows.length){ 
    const user=parseUser(rows);
    return(user);
  }
  return false;
};

exports.findById = async id => {
  const connection = await model.getConnection();
  const [rows] = await connection.execute('SELECT * FROM `Usuarios` WHERE `id` = ?',[id]);
  connection.end();
  if (rows.length){ 
    const user = parseUser(rows);
    return(user);
  }
  return false;
};


exports.createUser = async (req,res) =>{
  const connection = await model.getConnection();
  const user = parseUser(req.body.user);
  //INSERT INTO Usuarios VALUES (NULL,"jagaroc","$2b$13$F6K3EoRuYyu5XWz04UXzh.TnXu4gVxkMCywC1hDbCd/h6qRbQwTCu","javier@ieslasenia.org","Javier","Garcia Ortega",0,"javi.png");
  const [rows] = await connection.execute('INSERT INTO `Usuarios` VALUES (NULL,`?`,`?`,`?`,`?`,`?`',[user.nickname,user.password,use]);
  connection.end();
}


exports.findAllUsers = async (req,res)  => {

  console.log("Find all Users");
  const connection = await model.getConnection();
  const [rows] = await connection.execute('SELECT * FROM `Usuarios` ORDER BY id DESC');
  connection.end();
  const users = rows.map(row => ({id: row.id,
                                  nombre: row.nombre,
                                  apellidos: row.apellidos,
                                  nickname: row.nickname,
                                  password: row.password,
                                  email:row.email,
                                  avatar: row.avatar,
                                  admin: row.admin}));
  res.send(users);
  

};

exports.isValidToken = (req, res) => {
  const data = model.verifyToken(req.body.token);

  res.send({
    auth: data !== undefined,
    data
  });
};

const parseUser = results => {
  return {
    id: results[0].id,
    nombre: results[0].nombre,
    apellidos: results[0].apellidos,
    nickname: results[0].nickname,
    password: results[0].password,
    avatar: results[0].avatar,
    email:results[0].email,
    admin: results[0].admin
  };
};

