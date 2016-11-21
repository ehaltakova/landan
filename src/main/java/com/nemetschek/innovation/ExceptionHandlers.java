package com.nemetschek.innovation;

import com.nemetschek.innovation.util.JsonUtil;

import spark.ExceptionHandler;

/**
 * Exception handlers
 * @author Elitza Haltakova
 *
 */
public class ExceptionHandlers {

	/**
	 * Handle unchecked Exceptions (NullPointerException, IllegalArgumentException, ClassCastException, etc.)
	 */
	public static ExceptionHandler uncheckedExceptions = (e, request, response) -> {
		Application.logger.error(e.getMessage(), e);
		response.status(500);
		response.body(JsonUtil.toJson(new ResponseError("An internal error occured. Please, contact your system administrator.").getMessage()));
	};
}
