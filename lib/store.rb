# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  store.rb
#
require 'pseudo_wave.rb'
require 'lib/db_accessor.rb'

class Store < Hash
  def initialize(logger=Logger.new('log/store.log'))
    @logger = logger
    @current_bid = 1
    @dba = DbAccessor.new
    @keys = %w[board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments]
  end
  attr_accessor :current_bid, :dba

  def fromState(state)
    self[@current_bid] = state.get(@current_bid, 'dummy')
  end

  def update_store(params=nil)
    params = params ||
	{'bid'	=> @current_bid,
	'mask'	=> 7,
	'level'	=> 3,
	'range' => 'full'}
    @dba.read_params(params)
    @dba.set_masked_data_name
    @dba.determine_bid_range
    @dba.get_msg
    @logger.debug(@dba.log_format @dba.gotten)
    read_from_db @dba.gotten
  end

  def read_from_db(data)
    self.merge! data
  end
end
