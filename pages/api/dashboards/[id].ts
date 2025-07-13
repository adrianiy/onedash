import { NextApiResponse } from "next";
import { AuthenticatedRequest, withUserData } from "@/lib/middleware";
import { connectToDatabase } from "@/lib/mongodb";
import Dashboard, { IDashboard } from "@/lib/models/Dashboard";
import Widget from "@/lib/models/Widget";
import Variable from "@/lib/models/Variable";
import mongoose from "mongoose";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      error: "Usuario no autenticado",
    });
  }

  await connectToDatabase();

  const { id } = req.query;

  // Validar que el ID sea válido
  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({
      success: false,
      error: "ID de dashboard inválido",
    });
  }

  try {
    console.log("📊 Buscando dashboard con ID:", id);
    const dashboard = (await Dashboard.findOne({
      _id: id,
    }).lean()) as IDashboard | null;
    console.log("📊 Dashboard encontrado:", dashboard);

    // Verificar si existe el dashboard
    if (!dashboard) {
      return res.status(404).json({
        success: false,
        error: "Dashboard no encontrado",
      });
    }

    // Verificar permisos: propietario, colaborador, público o compartido
    const isOwner = dashboard.userId.toString
      ? dashboard.userId.toString() === req.user.id
      : dashboard.userId === req.user.id;
    const isCollaborator = dashboard.collaborators?.some(
      (collaboratorId) => collaboratorId.toString() === req.user?.id
    );
    const isPublic = dashboard.visibility === "public";
    const isShared = dashboard.isShared;
    const canView = isOwner || isCollaborator || isPublic || isShared;
    const canEdit = isOwner || isCollaborator;

    // GET - Obtener dashboard por ID
    if (req.method === "GET") {
      // Para ver un dashboard debe ser propietario, colaborador, público o compartido
      if (!canView) {
        return res.status(403).json({
          success: false,
          error: "No tienes permiso para ver este dashboard",
        });
      }

      return res.status(200).json({
        success: true,
        data: dashboard,
      });
    }

    // PUT - Actualizar dashboard
    if (req.method === "PUT") {
      // Solo el propietario o colaboradores pueden actualizar el dashboard
      if (!canEdit) {
        return res.status(403).json({
          success: false,
          error: "No tienes permiso para actualizar este dashboard",
        });
      }

      // Campos permitidos para actualizar
      const {
        name,
        description,
        layout,
        widgets,
        visibility,
        collaborators,
        defaultVariables,
        isShared,
      } = req.body;

      console.log(
        "🔄 Actualizando dashboard con defaultVariables:",
        defaultVariables
      );

      // Construir objeto de actualización dinámicamente
      const updateFields: Partial<IDashboard> = {};

      if (name) updateFields.name = name;
      if (description !== undefined) updateFields.description = description;
      if (layout) updateFields.layout = layout;
      if (widgets) updateFields.widgets = widgets;
      if (defaultVariables !== undefined) {
        updateFields.defaultVariables = defaultVariables;
        console.log(
          "📝 Incluyendo defaultVariables en update:",
          defaultVariables
        );
      }

      console.log(isOwner, isShared);
      // Solo el propietario puede cambiar la visibilidad, colaboradores y estado compartido
      if (isOwner) {
        if (visibility) updateFields.visibility = visibility;
        if (collaborators) updateFields.collaborators = collaborators;
        if (isShared !== undefined) updateFields.isShared = isShared;
      }

      // Actualizar en MongoDB con los campos dinámicos
      const result = await Dashboard.updateOne(
        { _id: dashboard._id },
        { $set: updateFields }
      );

      console.log("✅ Resultado de actualización MongoDB:", result);

      // Obtener el dashboard actualizado para devolverlo
      const updatedDashboard = (await Dashboard.findById(
        dashboard._id
      ).lean()) as IDashboard | null;

      console.log(
        "📊 Dashboard actualizado desde DB:",
        updatedDashboard?.defaultVariables
      );

      return res.status(200).json({
        success: true,
        data: updatedDashboard,
      });
    }

    // DELETE - Eliminar dashboard
    if (req.method === "DELETE") {
      // Solo el propietario puede eliminar el dashboard
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: "No tienes permiso para eliminar este dashboard",
        });
      }

      // Eliminar todos los widgets asociados al dashboard
      await Widget.deleteMany({ dashboardId: dashboard._id });

      // Eliminar todas las variables asociadas al dashboard
      await Variable.deleteMany({ dashboardId: dashboard._id });

      // Eliminar el dashboard
      await Dashboard.deleteOne({ _id: dashboard._id });

      return res.status(200).json({
        success: true,
        message: "Dashboard eliminado correctamente",
      });
    }

    // PATCH - Actualizar colaboradores (solo propietario)
    if (req.method === "PATCH" && req.query.action === "collaborators") {
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: "Solo el propietario puede gestionar colaboradores",
        });
      }

      const { collaborators, operation } = req.body;

      if (!collaborators || !Array.isArray(collaborators)) {
        return res.status(400).json({
          success: false,
          error: "Lista de colaboradores inválida",
        });
      }

      // Validar IDs de los colaboradores
      for (const id of collaborators) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            error: `ID de usuario inválido: ${id}`,
          });
        }
      }

      // Actualizar lista de colaboradores según la operación
      if (operation === "add") {
        // Añadir colaboradores (evitando duplicados)
        const currentCollaborators = dashboard.collaborators || [];
        const newCollaborators = [
          ...currentCollaborators,
          ...collaborators.filter(
            (id) => !currentCollaborators.some((c) => c.toString() === id)
          ),
        ];
        dashboard.collaborators = newCollaborators;
      } else if (operation === "remove") {
        // Eliminar colaboradores
        dashboard.collaborators = (dashboard.collaborators || []).filter(
          (id) => !collaborators.includes(id.toString())
        );
      } else if (operation === "set") {
        // Establecer lista completa
        dashboard.collaborators = collaborators;
      } else {
        return res.status(400).json({
          success: false,
          error: "Operación no válida. Use: add, remove o set",
        });
      }

      await Dashboard.updateOne(
        { _id: dashboard._id },
        { $set: { collaborators: dashboard.collaborators } }
      );

      return res.status(200).json({
        success: true,
        data: dashboard,
      });
    }

    // POST - Crear copia del dashboard (útil para dashboards readonly)
    if (req.method === "POST" && req.query.action === "copy") {
      // Cualquier usuario puede crear una copia si el dashboard es público
      if (!isOwner && !isPublic) {
        return res.status(403).json({
          success: false,
          error: "No tienes permiso para copiar este dashboard",
        });
      }

      // Crear nueva instancia con los datos del dashboard original
      const dashboardCopy = new Dashboard({
        name: `${dashboard.name} (Copia)`,
        description: dashboard.description,
        layout: dashboard.layout,
        widgets: dashboard.widgets,
        userId: req.user.id,
        visibility: "private", // Las copias son privadas por defecto
        originalId: dashboard._id,
        defaultVariables: dashboard.defaultVariables || {},
      });

      // Guardar nueva copia
      await dashboardCopy.save();

      return res.status(201).json({
        success: true,
        message: "Dashboard copiado correctamente",
        data: dashboardCopy,
      });
    }

    // Para otros métodos
    return res.status(405).json({
      success: false,
      error: `Método ${req.method} no permitido`,
    });
  } catch (error) {
    console.error(`Error al procesar dashboard ${id}:`, error);
    return res.status(500).json({
      success: false,
      error: "Error al procesar la solicitud del dashboard",
    });
  }
}

export default withUserData(handler);
