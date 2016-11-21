package bg.nemetschek.landan.ui;

import spark.Filter;
import spark.Request;
import spark.Response;

/**
 * Before and after filters for the API endpoints (middleware)
 * @author Elitza Haltakova
 *
 */
public class Filters {
	
	/**
	 * Before filter
	 * Add content type and CORS needed headers to the response.
	 */
	public static Filter addResponseHeaders = (Request request, Response response) -> {
		if(RequestUtil.clientAcceptsHtml(request)) {
			response.header("Content-Type", "text/html");
		} else if(RequestUtil.clientAcceptsJson(request)) {
			response.header("Content-Type", "application/json");
		}
	};

	/**
	 * After filter.
	 * Logs response status and body to the log file and the console.
	 */
	public static Filter logResponse = (Request request, Response response) -> {
		if(response.raw().getStatus() == 200) {
			Application.logger.debug(request.pathInfo() + ": " + response.raw().getStatus());
			Application.logger.debug(response.body());
		} else {
			Application.logger.error(request.pathInfo() + ": " + response.raw().getStatus());
			Application.logger.error(response.body());
		}
	};
}
