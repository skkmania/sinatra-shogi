# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  store.rb
#
require 'pseudo_wave.rb'
require 'lib/db_accessor.rb'

class Store < Hash
  def initialize
    @current_bid = 1
    @dba = DbAccessor.new
    @keys = %w[board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments]
  end
  attr_accessor :current_bid, :dba

  def fromState(state)
    self[@current_bid] = state.get(@current_bid, 'dummy')
  end

  def update
    self[@current_bid] =  'dummy'
  end
end
