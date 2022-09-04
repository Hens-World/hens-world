<?php
function allow_user_list() {
    // gets the author role
    $role = get_role( 'author' );
    $rolesub = get_role( 'subscriber' );

    // This only works, because it accesses the class instance.
    // would allow the author to edit others' posts for current theme only
    $role->add_cap( 'list_users' ); 
    $role->add_cap( 'edit_others_posts' ); 
    $rolesub->add_cap( 'list_users' ); 
    $rolesub->add_cap( 'publish_posts' ); 
    $rolesub->add_cap( 'edit_published_posts' ); 
    $rolesub->add_cap( 'edit_posts' ); 
    $rolesub->add_cap( 'edit_others_posts' ); 
}
add_action( 'admin_init', 'allow_user_list');

//
//MY PART
//
@ini_set( 'upload_max_size' , '80M' );
@ini_set( 'post_max_size', '80M');
@ini_set( 'max_execution_time', '400' );


add_action('after_setup_theme', 'remove_admin_bar');
add_action('after_setup_theme', 'allow_user_list');
add_theme_support( 'angular-wp-api' );
add_action('wp_logout','go_home');
function go_home(){
  wp_redirect( home_url() );
  exit();
}

add_action( 'init', 'blockusers_init' );
function blockusers_init() {
global $current_user; 
get_currentuserinfo(); 
if (is_admin() && !is_home() &&  user_can( $current_user, "subscriber" )) {
wp_redirect( home_url() );
exit;
}
}

function remove_admin_bar() {
  show_admin_bar(false);
}


function my_scripts() {
  $version = '0.7.0';
  add_theme_support( 'post-thumbnails', array( 'post', 'page', 'jeux_video','images','photos','videos', 'legendes','recits','articles' ) );

  wp_register_script(
    'libs',
    get_stylesheet_directory_uri() . '/js/libs/libs_'.$version.'.js'
  );

  wp_enqueue_script(
    'my-scripts',
    get_stylesheet_directory_uri() . '/js/scripts_'.$version.'.js',
    array( 'libs' )
  );

  wp_localize_script(
    'my-scripts',
    'myLocalized',
    array(
      'partials' => trailingslashit( get_template_directory_uri() ) . 'partials/',
      'json' => trailingslashit( get_template_directory_uri() ) . 'json/',
      'medias' => trailingslashit( get_template_directory_uri() ) . 'medias/',
      )
  );
  $script_data = null;
  $script_data[ 'base' ] = json_url();
  $script_data[ 'nonce' ] = wp_create_nonce( 'wp_json' );
  // Provide user id if logged in
  if ( is_user_logged_in() )
    $script_data[ 'user_id' ] = get_current_user_id();
  else
    $script_data[ 'user_id' ] = 0;

  // $script_data[ 'users'] = get_users();
  // Localize filterable data for script

  wp_localize_script(
    'my-scripts',
    'wpAPIData',
    $script_data
  );

}
// remove wp version param from any enqueued scripts
function vc_remove_wp_ver_css_js( $src ) {
    if ( strpos( $src, 'ver=' ) )
        $src = remove_query_arg( 'ver', $src );
        // $src = add_query_arg('ver',filemtime( get_stylesheet_directory() . '/style.css'),$src);
    return $src;
}
add_filter( 'style_loader_src', 'vc_remove_wp_ver_css_js', 9999 );
add_filter( 'script_loader_src', 'vc_remove_wp_ver_css_js', 9999 );

add_action( 'wp_enqueue_scripts', 'my_scripts' );


//
// TEST ANGULAR WP API
//
defined( 'ABSPATH' ) || die;
if ( ! function_exists( 'angular_wp_api_scripts' ) ) :
/**
 * Enqueue script & localize data
 */
function angular_wp_api_scripts() {
  // Leave if WP-API is not activated
  if ( ! defined( 'JSON_API_VERSION' ) )
    return;
  // Leave if not specifically requested from the theme or a plugin
  if ( ! $config = get_theme_support( 'angular-wp-api' ) )
    return;
  // Array of dependencies
  $script_dependencies = null;
  // Data for localization
  $script_data = null;
  // Script dependency from theme support
  if ( isset( $config[ 0 ] ) )
    $script_dependencies = $config[ 0 ];
  // Script data from theme support
  if ( isset( $config[ 1 ] ) )
    $script_data = $config[ 1 ];
  // Data for localization
  $script_data[ 'base' ] = json_url();
  $script_data[ 'nonce' ] = wp_create_nonce( 'wp_json' );
  // Provide user id if logged in
  if ( is_user_logged_in() )
    $script_data[ 'user_id' ] = get_current_user_id();
  else
    $script_data[ 'user_id' ] = 0;
  // Enqueue the script after dependency, in the footer
  wp_enqueue_script( 'angular-wp-api',
    plugins_url( 'angular-wp-api.min.js', __FILE__ ),
    apply_filters( 'angular_wp_api_script_dependencies', $script_dependencies ),
    '',
    true
  );
  // Localize filterable data for script
  wp_localize_script(
    'angular-wp-api',
    'wpAPIData',
    apply_filters( 'angular_wp_api_local_data', $script_data )
  );
}
// Hook `angular_wp_api_scripts` to the `wp_enqueue_scripts` action
add_action( 'wp_enqueue_scripts', 'angular_wp_api_scripts' );
endif;