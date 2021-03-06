const model = require("../model/pm_manager.model");
const {
  findById,
  parseUserExported: parseUser,
} = require("./users.controllers");


exports.findAllProjectsByCourse = async (req,res) => {
  const connection = await model.getConnection();
  const { id } = req.params;

  const [
    rows,
  ] = await connection.execute("SELECT * FROM Usuarios WHERE id IN (SELECT id_usuario FROM `UsuariosCurso` WHERE `id_curso` = ?)", [id]);
  connection.end();
  res.send(JSON.stringify(rows));

};

exports.updateKanbanProject = async (req,res)=>{

  const connection = await model.getConnection();

  let proyecto = req.body;
  
  const { tablero } = proyecto;
  console.log(tablero);
  const [projectUpdated] = await connection.query("SELECT JSON_SET(tablero,'columns',"+tablero+") FROM `Proyectos` WHERE id = "+proyecto.id);

  connection.end();

  res.send({message:"ok"});

}

exports.updateProject = async (req, res) => {
  const alertMessage = {
    message: "",
    type: "",
  };

  const connection = await model.getConnection();

  let projecto = req.body;
  const { usuarios, tecnologias } = projecto;
  const { alumnos, profesores } = usuarios;

  const [
    tecnologiasDeleted,
  ] = await connection.execute(
    "DELETE FROM `TecnologiasProyecto` WHERE id_proyecto = ? ",
    [projecto.id]
  );
  tecnologias.map(async (tecnologia) => {
    await connection.execute("INSERT INTO `TecnologiasProyecto` VALUES (?,?)", [
      projecto.id,
      tecnologia.id,
    ]);
  });

  const [
    usuariosDeleted,
  ] = await connection.execute(
    "DELETE FROM `PerfilesProyecto` WHERE id_proyecto = ? ",
    [projecto.id]
  );
  alumnos.map(async (alumno) => {
    await connection.execute("INSERT INTO `PerfilesProyecto` VALUES (3,?,?)", [
      alumno.id,
      projecto.id,
    ]);
  });
  profesores.map(async (profesor) => {
    await connection.execute("INSERT INTO `PerfilesProyecto` VALUES (4,?,?)", [
      profesor.id,
      projecto.id,
    ]);
  });

  const [
    projectoUpdated,
  ] = await connection.execute(
    "UPDATE `Proyectos` SET nombre = ? , descripcion = ? WHERE id = ? ",
    [projecto.nombre, projecto.descripcion, projecto.id]
  );

  alertMessage.message = "Proyecto actualizado correctamente";
  alertMessage.type = "success";

  connection.end();
  res.status(200).send(alertMessage);
};

exports.findAllProjects = async (req, res) => {
  const connection = await model.getConnection();
  let consulta;

  if (req.user.admin == true) {
    consulta = "SELECT * FROM `Proyectos`";
  } else {
    // "select * from Proyectos inner join PerfilesProyecto where PerfilesProyecto.id = req.user.id"
    consulta =
      "SELECT * FROM `Proyectos` INNER JOIN `PerfilesProyecto` perfProj ON perfProj.id_proyecto = `Proyectos`.id WHERE perfProj.id_usuario = ? AND perfProj.id_perfil = 3";
  }

  const [rows] = await connection.execute(consulta, [req.user.id]);
  const techProjects = Promise.all(
    rows.map(async (row) => {
      const [
        tecnologias,
      ] = await connection.execute(
        "SELECT * FROM `Tecnologias` techs INNER JOIN `TecnologiasProyecto` tProj ON tProj.id_tecnologia = techs.id WHERE tProj.id_proyecto = ?",
        [row.id]
      );
      const [
        students,
      ] = await connection.execute(
        "SELECT * FROM `PerfilesProyecto` pProj INNER JOIN `Usuarios` usr ON usr.id = pProj.id_usuario WHERE pProj.id_proyecto = ? AND pProj.id_perfil=3",
        [row.id]
      );
      const [
        teachers,
      ] = await connection.execute(
        "SELECT * FROM `PerfilesProyecto` pProj INNER JOIN `Usuarios` usr ON usr.id = pProj.id_usuario WHERE pProj.id_proyecto = ? AND pProj.id_perfil=4",
        [row.id]
      );
      const techs = tecnologias.map((tech) => {
        return {
          id: tech.id,
          nombre: tech.nombre,
          descripcion: tech.descripcion,
          logo: tech.logo,
          creador: tech.creador,
          version: tech.version,
        };
      });

      const alumnos = students.map((user) => {
        return {
          id: user.id,
          nombre: user.nombre,
          apellidos: user.apellidos,
          nickname: user.nickname,
          email: user.email,
          avatar: user.avatar,
          admin: Boolean(user.admin),
        };
      });

      const profesores = teachers.map((user) => {
        return {
          id: user.id,
          nombre: user.nombre,
          apellidos: user.apellidos,
          nickname: user.nickname,
          email: user.email,
          avatar: user.avatar,
          admin: Boolean(user.admin),
        };
      });

      return {
        ...row,
        tecnologias: techs,
        usuarios: { alumnos: alumnos, profesores: profesores },
        //usuarios['profesores']= profesores}
      };
    })
  ).then((resp) => {
    connection.end();
    res.send(resp);
  });

  //connection.end();
  //res.send(rows);
};
