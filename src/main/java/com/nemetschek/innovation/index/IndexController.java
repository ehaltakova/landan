package com.nemetschek.innovation.index;

import java.util.HashMap;
import java.util.Map;

import com.nemetschek.innovation.Path;
import com.nemetschek.innovation.util.AuthenticationUtil;
import com.nemetschek.innovation.util.HTTPUtil;
import com.nemetschek.innovation.util.ViewUtil;
import com.nemetschek.innovation.util.HTTPUtil.HTTPResponse;

import spark.Request;
import spark.Response;
import spark.Route;

/**
 * Index page controller.
 * @author Elitza Haltakova
 *
 */
public class IndexController {

	public static Route serveIndexPage = (Request request, Response response) -> {
		Map<String, Object> model = new HashMap<>();
		return ViewUtil.render(request, model, Path.Template.INDEX);
	};
	
	public static Route serveTestPage = (Request request, Response response) -> {
		
		response.header("Content-Type", "application/json");
		
		// headers
		Map<String, String> headers = new HashMap<String, String>();
		headers.put("Authorization", "Basic " + AuthenticationUtil.getBase64EncodedCredentialsDemoUser());
		headers.put("Content-Type", "application/json");
		headers.put("charset", "utf-8");
		
		HTTPResponse resp = HTTPUtil.getRequest("https://experts.nemetschek.bg/test-jira/rest/api/2/issue/ATC-4", headers);
		return resp.body;
	};
}
