package bg.nemetschek.landan.ui;

import static spark.Spark.*;
import static spark.debug.DebugScreen.*;

import spark.servlet.SparkApplication;

import org.apache.log4j.Logger;

import bg.nemetschek.landan.ui.index.IndexController;
import bg.nemetschek.landan.ui.planes.PlanesController;
import bg.nemetschek.landan.ui.util.CORSUtil;
import bg.nemetschek.landan.ui.util.ConfigUtil;
/**
 * Main API class defining all the end points
 * @author Elitza Haltakova
 *
 */
public class Application implements SparkApplication {
	
	final static Logger logger = Logger.getLogger(Application.class);
	
	public static void main(String[] args) {
		
		Application app = new Application();
		app.init();
	}

	@Override
	public void init() {
		
		// configure port and static resource files directory
		port(ConfigUtil.PORT);
		staticFiles.location("/public");
		staticFiles.expireTime(600L);
		
		// enable debug screen if application is in DEV mode
		if(ConfigUtil.appMode.name().equals("DEV")) {
			enableDebugScreen();
		}
		
		// enable CORS
		CORSUtil.enableCORS();

		// set up before and after filters
		before(Filters.addResponseHeaders);
		after(Filters.logResponse);
		
		// register exception handlers
		exception(Exception.class, ExceptionHandlers.uncheckedExceptions);
		
		// routes
		get(Path.INDEX, IndexController.serveIndexPage);
		get(Path.PLANE, PlanesController.createPlanePage);
		post(Path.AJAX_GET_PLANES, PlanesController.getPlanes);
		post(Path.AJAX_APPROVE_LANDING, PlanesController.changeStatus);
		post(Path.AJAX_CREATE_PLANE, PlanesController.createPlane);
		get(Path.AJAX_GET_PLANE, PlanesController.getPlane);
		
		get("/test", IndexController.serveTestPage);

	}	
}
