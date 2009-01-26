#!/usr/bin/ruby
require 'cgi'
require 'erb'
require 'kconv'

app_file_dir      = "app"
xml_file_template = "opensocial_app.xml"

data={}

if File.exists?("#{app_file_dir}/module.xml")
  data['module'] = File.open("#{app_file_dir}/module.xml").read
else
  data['module'] = '<ModulePrefs title="untitled"><Require feature="opensocial-0.8"/></ModulePrefs>'
end
%w[home canvas profile preview].each do |name|
  file_name = name
  if !File.exists?("#{app_file_dir}/#{name}.html")
    file_name = "home"
  end
  if File.exists?("#{app_file_dir}/#{file_name}.html")
    data[name] = File.open("#{app_file_dir}/#{file_name}.html").read
  end
end

print "Content-type: text/xml\n\n"

erb = ERB.new(File.open("#{app_file_dir}/#{xml_file_template}").read)
res = erb.result(binding)

print res

File.open("#{File.dirname(__FILE__)}/app.xml","w") do |f|
  f.write res
end
