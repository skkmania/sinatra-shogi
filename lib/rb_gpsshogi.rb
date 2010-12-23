require 'fileutils'

class GpsShogi 

  def GpsShogi.make_time_string
    return Time::now.strftime("%Y%m%d-%H-%M-%S")
  end

  def make_command
    options = { :initial_filename => '-f',
                :black => '-b', :white => '-w',
                :limit => '-l', :table_size => '-t',
                :table_record_limit => '-L',
                :node_limit => '-n',
                :timeleft => '-T', :byoyomi => '-B',
                :record_filename => '-o',
                :kisen_id => '-k',
                :kisen_file => '-K',
                :csa_file => '--csa-file',
                :book_moves => '-m'
              }
    raise "record_filename or csa_file not defined" unless @config[:record_filename] || @config[:csa_file]
    raise "log_filename not defined" unless @config[:log_filename]
    
    command = []
    command << @config[:base_command] << @config[:other_options]
    command << "-s" if @config[:sente]
    @config.each_key do |key|
      next unless options[key]
      command << options[key] << @config[key]
    end
    command << "2>" << @config[:log_filename]
    return command.join(" ")
  end

  def initialize(config)
    @config = config
    @num_respawned = 0
    @config[:record_filename] = 
          make_record_filename(@config[:initial_filename],
                               @config[:black], @config[:white]) unless @config[:record_filename]
    time_string = GpsShogi::make_time_string()
    unless @config[:log_filename]
      logfile = "%s%s-%s-%s.log" % 
        [@config[:logfile_basename], time_string, @config[:black], @config[:white]]
      @config[:log_filename] = logfile
    end

    @command = make_command
    STDERR.puts "SYSTEM:execute '#{@command}'"
    @io = IO::popen(@command, "r+")
    @io.sync = true
  end

  def set_logger(logger)
    @logger = logger
    @logger.sync = true
  end

  def set_master_record(master)
    @master_record = master
  end

  def respawn
    STDERR.puts  "into respawn"
    STDERR.puts  "SYSTEM:try respawn %s" % [@num_respawned]
    @logger.puts "SYSTEM:try respawn %s" % [@num_respawned] if @logger
    @num_respawned += 1
    return false if @num_respawned > 10

    [@config[:record_filename], @config[:log_filename]].each do |file|
      if File.exist? file
        FileUtils.move(file, "%s.%s" % [file, @num_respawned])
      else
        warn "The file was not created yet: %s" % [file]
      end
    end

    if !@master_record 
      STDERR.puts "master_record not defined"
      return false
    end
    @config[:initial_filename] = @master_record
    respawn_command = make_command
    STDERR.puts  "SYSTEM:execute '%s'" % [respawn_command]
    @logger.puts "SYSTEM:execute '%s'" % [respawn_command] if @logger

    @io = IO::popen(respawn_command, "r+")
    @io.sync = true
    return true
  end

  def send(message)
    # message ends with \n
    now = Time::now.strftime("%a %b %d %H:%M:%S %Y")
    STDERR.puts  "TGPS:%s%s" % [message, now]  # &ctime(time)
    @logger.puts "TGPS:%s%s" % [message, now] if @logger
    begin
      STDERR.puts "in GpsShogi#send before write: io.writable? : #{@io.stat.writable?}" 
      @io.write message
      STDERR.puts "written : #{message} to binary program" 
    rescue
      STDERR.puts "write failed: #$!"
      respawn()
    end
  end

  def respawn_and_read
    STDERR.puts "into respawn_and_read and going to call respawn"
    return nil unless respawn()
    STDERR.puts "leaving respawn_and_read with calling read"
    return read()
  end

  def read
    line = ""
    begin
      STDERR.puts "waiting prog_read : #{@io.stat.readable?}" 
      line = @io.gets
      STDERR.puts "got line : size -> #{line.size}, line ->  #{line}" if line
    rescue
      STDERR.puts "prog_read failed: #$!" 
      return respawn_and_read()
    end
    if line
      now = Time::now.strftime("%a %b %d %H:%M:%S %Y")
      STDERR.puts  "FGPS:%s%s" % [line, now] #,&ctime(time)
      @logger.puts "FGPS:%s%s" % [line, now] if @logger
    else
      # nil means end of line
      STDERR.puts "prog_read failed : nil(EOL). going to respawn_and_read" 
      return respawn_and_read()
    end
    return line
  end

  # utility
  def make_record_filename(initial_filename, black, white)
    record_filename = initial_filename.gsub(/\.[^.]*/, "")
    record_filename += "-#{black}-#{white}.csa"
    return record_filename
  end

end
