#!/usr/bin/perl
use strict;
use warnings;
use CGI;

use Template;

use Data::Dumper;

my $q = CGI->new;
my $stash = {};
$stash->{url} = 'http://www.tatamilab.jp/~toshi_i/schedule/List?h=' . $q->param('keywords');

print qq(Content-Type: text/plain; charset="utf-8"\n\n);
my $tt = Template->new({ INCLUDE_PATH => '.' });
$tt->process('tyouseisan_watcher.tt',$stash) || die $tt->error();

exit;

