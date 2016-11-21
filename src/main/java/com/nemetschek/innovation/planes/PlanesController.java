package com.nemetschek.innovation.planes;

import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.nemetschek.innovation.Path;
import com.nemetschek.innovation.util.AuthenticationUtil;
import com.nemetschek.innovation.util.HTTPUtil;
import com.nemetschek.innovation.util.JsonUtil;
import com.nemetschek.innovation.util.ViewUtil;
import com.nemetschek.innovation.util.HTTPUtil.HTTPResponse;

import spark.Request;
import spark.Response;
import spark.Route;

public class PlanesController {

	private static final String JIRA_REST_API = "https://experts.nemetschek.bg/test-jira/rest/api/2";
	
	public static Route getPlanes = (Request request, Response response) -> {
		
		// data
		JsonObject json = new JsonObject();
		json.addProperty("jql",  "project=ATC&type='Landing Plane'&status not in ('Closed', 'Landed')");
		JsonArray fields = new JsonArray();
		fields.add("summary");
		fields.add("status");
		fields.add("position");
		fields.add("customfield_13400");
		fields.add("customfield_13401");
		fields.add("customfield_13402");
		fields.add("customfield_13403");
		fields.add("updated");
		fields.add("priority");
		fields.add("issuetype");
		json.add("fields", fields);
		String jsonBody = json.toString();
		
		// headers
		Map<String, String> headers = new HashMap<String, String>();
		System.err.println(AuthenticationUtil.getBase64EncodedCredentials());
		headers.put("Authorization", "Basic " + AuthenticationUtil.getBase64EncodedCredentials());
		headers.put("Content-Type", "application/json");
		headers.put("charset", "utf-8");
		
		HTTPResponse resp = HTTPUtil.postRequest(JIRA_REST_API, "/search", jsonBody, headers);
		return resp.body;
	};
	
	public static Route changeStatus = (Request request, Response response) -> {
		
		Map<String, Object> requestData = JsonUtil.fromJson(request.body());
		String issueKey = (String) requestData.get("key");
		String transitionNr = (String) requestData.get("transition");
		String gate = (String) requestData.get("gate");
		
		// data
		JsonObject json = new JsonObject();
		JsonObject transition = new JsonObject();
		transition.addProperty("id", transitionNr);
		json.add("transition", transition);
		JsonObject fields = new JsonObject();
		JsonObject gateField = new JsonObject();
		gateField.addProperty("value", gate);
		fields.add("customfield_13403", gateField);
		json.add("fields", fields);
		String jsonBody = json.toString();
		System.err.println(jsonBody);
		
		// headers
		Map<String, String> headers = new HashMap<String, String>();
		headers.put("Authorization", "Basic " + AuthenticationUtil.getBase64EncodedCredentials());
		headers.put("Content-Type", "application/json");
		headers.put("charset", "utf-8");
		
		HTTPResponse resp = HTTPUtil.postRequest(JIRA_REST_API, "/issue/" + issueKey + "/transitions", jsonBody, headers);
		return resp.body;
	};

	public static Route createPlanePage = (Request request, Response response) -> {
		Map<String, Object> model = new HashMap<>();
		return ViewUtil.render(request, model, Path.Template.PLANE);
	};
	
	public static Route createPlane = (Request request, Response response) -> {
		
		// headers
		Map<String, String> headers = new HashMap<String, String>();
		headers.put("Authorization", "Basic " + AuthenticationUtil.getBase64EncodedCredentials());
		headers.put("Content-Type", "application/json");
		headers.put("charset", "utf-8");
		
		HTTPResponse resp = HTTPUtil.postRequest(JIRA_REST_API, "/issue/", request.body(), headers);
		return resp.body;
	};

	public static Route getPlane = (Request request, Response response) -> {
		
		// headers
		Map<String, String> headers = new HashMap<String, String>();
		headers.put("Authorization", "Basic " + AuthenticationUtil.getBase64EncodedCredentials());
		headers.put("Content-Type", "application/json");
		headers.put("charset", "utf-8");
		
		HTTPResponse resp = HTTPUtil.getRequest(JIRA_REST_API+"/issue/"+request.splat()[0], headers);
		return resp.body;
	};
}
