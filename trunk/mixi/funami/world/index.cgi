#!/usr/bin/ruby
require 'cgi'
require 'erb'
require 'kconv'

xml_file_template = "mixiapp.xml"

data={}
%w[home canvas profile preview].each do |name|
  file_name = name
  if !File.exists?("#{name}.html")
    file_name = "home"
  end
  if File.exists?("#{file_name}.html")
    data[name] = File.open("#{file_name}.html").read
  end
end

print "Content-type: text/xml\n\n"

erb = ERB.new(File.open(xml_file_template).read)
#print Kconv.toeuc(erb.result(binding))
res = erb.result(binding)

print res

File.open("#{File.dirname(__FILE__)}/app.xml","w") do |f|
  f.write res
end
