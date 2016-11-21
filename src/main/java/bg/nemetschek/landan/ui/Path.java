package bg.nemetschek.landan.ui;

/**
 * Application routes and API end points.
 * @author Elitza Haltakova
 *
 */
public class Path {
		
	// application urls
	public static final String INDEX = "/index";
	public static final String PLANE = "/plane";

	// api end points
	private static final String API = "/innovasion/api";
	public static final String AJAX_GET_PLANES = API + "/planes";
	public static final String AJAX_APPROVE_LANDING =  API + "/plane/change";
	public static final String AJAX_CREATE_PLANE =  API + "/plane/create";
	public static final String AJAX_GET_PLANE = API + "/plane/*";
	
	// template files paths
	public static class Template {
        public final static String INDEX = "/velocity/index/index.vm";
		public static final String PLANE = "/velocity/plane/plane.vm";
    }
}
